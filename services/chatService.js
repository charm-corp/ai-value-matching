const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Match = require('../models/Match');

class ChatService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 New socket connection: ${socket.id}`);

      // 사용자 인증 및 연결
      socket.on('authenticate', async (data) => {
        try {
          const { userId, token } = data;
          
          // 토큰 검증 로직 (실제로는 JWT 검증)
          if (!userId || !token) {
            socket.emit('auth_error', { message: '인증 정보가 필요합니다.' });
            return;
          }

          // 사용자 연결 정보 저장
          this.connectedUsers.set(userId, socket.id);
          this.userSockets.set(socket.id, userId);
          
          console.log(`👤 User ${userId} authenticated on socket ${socket.id}`);
          
          // 사용자 온라인 상태 업데이트
          await this.updateUserOnlineStatus(userId, true);
          
          // 사용자의 활성 대화방들에 참여
          await this.joinUserConversations(socket, userId);
          
          socket.emit('authenticated', { 
            success: true, 
            userId,
            message: '실시간 채팅에 연결되었습니다.'
          });

        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth_error', { message: '인증 중 오류가 발생했습니다.' });
        }
      });

      // 대화방 참여
      socket.on('join_conversation', async (data) => {
        try {
          const { conversationId } = data;
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            socket.emit('error', { message: '인증이 필요합니다.' });
            return;
          }

          // 대화방 권한 확인
          const conversation = await Conversation.findById(conversationId);
          if (!conversation || !conversation.participants.includes(userId)) {
            socket.emit('error', { message: '대화방 접근 권한이 없습니다.' });
            return;
          }

          socket.join(conversationId);
          console.log(`👥 User ${userId} joined conversation ${conversationId}`);
          
          // 읽음 상태 업데이트
          await this.markMessagesAsRead(conversationId, userId);
          
          socket.emit('joined_conversation', { conversationId });

        } catch (error) {
          console.error('Join conversation error:', error);
          socket.emit('error', { message: '대화방 참여 중 오류가 발생했습니다.' });
        }
      });

      // 메시지 전송
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, content, type = 'text', replyTo } = data;
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {
            socket.emit('error', { message: '인증이 필요합니다.' });
            return;
          }

          // 대화방 존재 및 권한 확인
          const conversation = await Conversation.findById(conversationId);
          if (!conversation || !conversation.participants.includes(userId)) {
            socket.emit('error', { message: '메시지 전송 권한이 없습니다.' });
            return;
          }

          // 메시지 생성
          const message = new Message({
            conversationId,
            senderId: userId,
            content: content.trim(),
            type,
            replyTo
          });

          await message.save();

          // 메시지 정보 채우기
          await message.populate('senderId', 'name profileImage');
          if (replyTo) {
            await message.populate('replyTo', 'content senderId');
          }

          // 대화방 정보 업데이트
          conversation.lastMessage = message._id;
          conversation.lastActivity = new Date();
          await conversation.save();

          // 실시간으로 메시지 전송
          this.io.to(conversationId).emit('new_message', {
            message: {
              _id: message._id,
              conversationId: message.conversationId,
              senderId: message.senderId,
              content: message.content,
              type: message.type,
              replyTo: message.replyTo,
              createdAt: message.createdAt,
              readBy: message.readBy
            }
          });

          // 상대방에게 알림 전송 (오프라인 사용자)
          await this.sendNotificationToParticipants(conversation, message, userId);

          console.log(`💬 Message sent in conversation ${conversationId} by user ${userId}`);

        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: '메시지 전송 중 오류가 발생했습니다.' });
        }
      });

      // 타이핑 상태
      socket.on('typing_start', (data) => {
        const { conversationId } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId && conversationId) {
          socket.to(conversationId).emit('user_typing', { 
            userId, 
            conversationId,
            typing: true 
          });
        }
      });

      socket.on('typing_stop', (data) => {
        const { conversationId } = data;
        const userId = this.userSockets.get(socket.id);
        
        if (userId && conversationId) {
          socket.to(conversationId).emit('user_typing', { 
            userId, 
            conversationId,
            typing: false 
          });
        }
      });

      // 메시지 읽음 처리
      socket.on('mark_as_read', async (data) => {
        try {
          const { conversationId, messageId } = data;
          const userId = this.userSockets.get(socket.id);
          
          if (!userId) {return;}

          if (messageId) {
            // 특정 메시지 읽음 처리
            await Message.findByIdAndUpdate(messageId, {
              $addToSet: { readBy: { userId, readAt: new Date() } }
            });
          } else {
            // 대화방의 모든 메시지 읽음 처리
            await this.markMessagesAsRead(conversationId, userId);
          }

          // 상대방에게 읽음 상태 알림
          socket.to(conversationId).emit('message_read', {
            conversationId,
            messageId,
            readBy: userId
          });

        } catch (error) {
          console.error('Mark as read error:', error);
        }
      });

      // 연결 해제
      socket.on('disconnect', async () => {
        const userId = this.userSockets.get(socket.id);
        
        if (userId) {
          console.log(`👋 User ${userId} disconnected from socket ${socket.id}`);
          
          // 연결 정보 제거
          this.connectedUsers.delete(userId);
          this.userSockets.delete(socket.id);
          
          // 사용자 오프라인 상태 업데이트
          await this.updateUserOnlineStatus(userId, false);
        }
      });
    });
  }

  // 사용자 온라인 상태 업데이트
  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline,
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Update online status error:', error);
    }
  }

  // 사용자의 대화방들에 참여
  async joinUserConversations(socket, userId) {
    try {
      const conversations = await Conversation.find({
        participants: userId,
        status: 'active'
      }).select('_id');

      conversations.forEach(conv => {
        socket.join(conv._id.toString());
      });

      console.log(`🏠 User ${userId} joined ${conversations.length} conversations`);
    } catch (error) {
      console.error('Join user conversations error:', error);
    }
  }

  // 메시지 읽음 처리
  async markMessagesAsRead(conversationId, userId) {
    try {
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: userId },
          'readBy.userId': { $ne: userId }
        },
        {
          $push: { readBy: { userId, readAt: new Date() } }
        }
      );
    } catch (error) {
      console.error('Mark messages as read error:', error);
    }
  }

  // 참가자들에게 알림 전송
  async sendNotificationToParticipants(conversation, message, senderId) {
    try {
      const participants = conversation.participants.filter(
        p => p.toString() !== senderId.toString()
      );

      for (const participantId of participants) {
        const socketId = this.connectedUsers.get(participantId.toString());
        
        if (socketId) {
          // 온라인 사용자에게 실시간 알림
          this.io.to(socketId).emit('conversation_notification', {
            conversationId: conversation._id,
            message: {
              senderId: message.senderId,
              content: message.content,
              createdAt: message.createdAt
            }
          });
        } else {
          // 오프라인 사용자에게는 이메일 알림 등 (나중에 구현)
          console.log(`📱 Offline notification needed for user ${participantId}`);
        }
      }
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }

  // 새 대화 시작
  async startConversation(matchId, participants, initialMessage = null) {
    try {
      // 기존 대화방 확인
      let conversation = await Conversation.findOne({
        matchId,
        participants: { $all: participants }
      });

      if (!conversation) {
        // 새 대화방 생성
        conversation = new Conversation({
          matchId,
          participants,
          status: 'active',
          startedAt: new Date()
        });

        await conversation.save();
        console.log(`💬 New conversation created: ${conversation._id}`);
      }

      // 초기 메시지가 있으면 전송
      if (initialMessage && initialMessage.trim()) {
        const message = new Message({
          conversationId: conversation._id,
          senderId: participants[0], // 첫 번째 참가자가 보낸 것으로 가정
          content: initialMessage.trim(),
          type: 'text'
        });

        await message.save();
        await message.populate('senderId', 'name profileImage');

        conversation.lastMessage = message._id;
        conversation.lastActivity = new Date();
        await conversation.save();

        // 실시간으로 메시지 전송
        this.io.to(conversation._id.toString()).emit('new_message', {
          message
        });
      }

      return conversation;

    } catch (error) {
      console.error('Start conversation error:', error);
      throw error;
    }
  }

  // 온라인 사용자 확인
  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString());
  }

  // 대화방에 참여 중인 사용자 수
  getConversationParticipantCount(conversationId) {
    const room = this.io.sockets.adapter.rooms.get(conversationId);
    return room ? room.size : 0;
  }

  // 시스템 메시지 전송 (매치 성공 등)
  async sendSystemMessage(conversationId, content, type = 'system') {
    try {
      const message = new Message({
        conversationId,
        senderId: null, // 시스템 메시지
        content,
        type
      });

      await message.save();

      this.io.to(conversationId).emit('new_message', {
        message: {
          _id: message._id,
          conversationId: message.conversationId,
          senderId: null,
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
          isSystem: true
        }
      });

      console.log(`🤖 System message sent to conversation ${conversationId}`);

    } catch (error) {
      console.error('Send system message error:', error);
    }
  }
}

module.exports = ChatService;