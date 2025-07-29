const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Match = require('../models/Match');
const {
  authenticate,
  requireVerified,
  requireConversationParticipant,
} = require('../middleware/auth');
const {
  validateMessageSend,
  validatePagination,
  validateObjectId,
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: 대화 목록 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, blocked, ended]
 *         description: 대화 상태 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 결과 수
 *     responses:
 *       200:
 *         description: 대화 목록 조회 성공
 */
router.get(
  '/conversations',
  authenticate,
  requireVerified,
  validatePagination,
  async (req, res) => {
    try {
      const { status = 'active', page = 1, limit = 20 } = req.query;

      // 대화 목록 조회
      const conversations = await Conversation.findUserConversations(req.user._id, status);

      // 페이지네이션 적용
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedConversations = conversations.slice(skip, skip + parseInt(limit));

      // 각 대화의 읽지 않은 메시지 수 추가
      const conversationsWithUnread = await Promise.all(
        paginatedConversations.map(async conv => {
          const unreadCount = conv.getUnreadCount(req.user._id);

          return {
            id: conv._id,
            participants: conv.participants.map(p => ({
              id: p._id,
              name: p.name,
              profileImage: p.profileImage,
              isOnline: p.isOnline,
              lastActive: p.lastActive,
            })),
            matchId: conv.matchId,
            lastMessage: conv.lastMessage,
            unreadCount,
            lastActivityAt: conv.lastActivityAt,
            daysSinceStart: conv.daysSinceStart,
            status: conv.status,
          };
        })
      );

      res.json({
        success: true,
        data: {
          conversations: conversationsWithUnread,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: conversations.length,
            pages: Math.ceil(conversations.length / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        error: '대화 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }
);

/**
 * @swagger
 * /api/chat/conversations/{id}:
 *   get:
 *     summary: 특정 대화 상세 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 대화 ID
 *     responses:
 *       200:
 *         description: 대화 상세 조회 성공
 *       404:
 *         description: 대화를 찾을 수 없음
 *       403:
 *         description: 접근 권한 없음
 */
router.get(
  '/conversations/:id',
  authenticate,
  validateObjectId('id'),
  requireConversationParticipant,
  async (req, res) => {
    try {
      const conversation = req.conversation; // requireConversationParticipant에서 설정됨

      // 대화를 읽음으로 표시
      await conversation.markAsRead(req.user._id);

      // 상대방 정보
      const otherParticipant = conversation.getOtherParticipant(req.user._id);
      const otherUser = conversation.participants.find(
        p => p._id.toString() === otherParticipant.toString()
      );

      res.json({
        success: true,
        data: {
          conversation: {
            id: conversation._id,
            participants: conversation.participants.map(p => ({
              id: p._id,
              name: p.name,
              profileImage: p.profileImage,
              isOnline: p.isOnline,
              lastActive: p.lastActive,
            })),
            otherUser: otherUser
              ? {
                  id: otherUser._id,
                  name: otherUser.name,
                  profileImage: otherUser.profileImage,
                  isOnline: otherUser.isOnline,
                  lastActive: otherUser.lastActive,
                }
              : null,
            matchId: conversation.matchId,
            lastMessage: conversation.lastMessage,
            status: conversation.status,
            startedAt: conversation.startedAt,
            lastActivityAt: conversation.lastActivityAt,
            settings: conversation.settings,
            stats: conversation.stats,
          },
        },
      });
    } catch (error) {
      console.error('Get conversation details error:', error);
      res.status(500).json({
        success: false,
        error: '대화 상세 조회 중 오류가 발생했습니다.',
      });
    }
  }
);

/**
 * @swagger
 * /api/chat/conversations/{id}/messages:
 *   get:
 *     summary: 대화의 메시지 목록 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 대화 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 메시지 수
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: 이 시간 이전의 메시지만 조회
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 */
router.get(
  '/conversations/:id/messages',
  authenticate,
  validateObjectId('id'),
  requireConversationParticipant,
  validatePagination,
  async (req, res) => {
    try {
      const { page = 1, limit = 50, before } = req.query;
      const conversationId = req.params.id;

      const query = {
        conversationId,
        isDeleted: { $ne: true },
      };

      // before 파라미터가 있으면 해당 시간 이전의 메시지만 조회
      if (before) {
        query.timestamp = { $lt: new Date(before) };
      }

      // 페이지네이션 설정
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // 메시지 조회 (최신순으로 정렬)
      const [messages, total] = await Promise.all([
        Message.find(query)
          .populate('sender', 'name profileImage')
          .populate('replyTo', 'content sender timestamp')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Message.countDocuments(query),
      ]);

      // 메시지를 읽음으로 표시
      const unreadMessages = messages.filter(
        msg => !msg.isReadBy(req.user._id) && msg.sender._id.toString() !== req.user._id.toString()
      );

      await Promise.all(unreadMessages.map(msg => msg.markAsRead(req.user._id)));

      // 메시지 순서를 시간순으로 변경 (오래된 것부터)
      const sortedMessages = messages.reverse();

      res.json({
        success: true,
        data: {
          messages: sortedMessages.map(formatMessageForResponse),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
            hasNext: skip + parseInt(limit) < total,
          },
        },
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        error: '메시지 조회 중 오류가 발생했습니다.',
      });
    }
  }
);

/**
 * @swagger
 * /api/chat/conversations/{id}/messages:
 *   post:
 *     summary: 메시지 전송
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 대화 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *               type:
 *                 type: string
 *                 enum: [text, image, emoji, sticker]
 *               replyTo:
 *                 type: string
 *                 description: 답장할 메시지 ID
 *     responses:
 *       201:
 *         description: 메시지 전송 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post(
  '/conversations/:id/messages',
  authenticate,
  validateObjectId('id'),
  requireConversationParticipant,
  validateMessageSend,
  async (req, res) => {
    try {
      const { content, type = 'text', replyTo } = req.body;
      const conversation = req.conversation;

      // 대화가 활성 상태인지 확인
      if (conversation.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: '비활성 상태의 대화에는 메시지를 보낼 수 없습니다.',
        });
      }

      // 답장 메시지 확인 (있는 경우)
      if (replyTo) {
        const replyMessage = await Message.findById(replyTo);
        if (
          !replyMessage ||
          replyMessage.conversationId.toString() !== conversation._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            error: '유효하지 않은 답장 메시지입니다.',
          });
        }
      }

      // 새 메시지 생성
      const message = new Message({
        conversationId: conversation._id,
        sender: req.user._id,
        content: content.trim(),
        type,
        replyTo: replyTo || undefined,
      });

      await message.save();

      // 메시지 정보와 함께 populate
      await message.populate('sender', 'name profileImage');
      if (replyTo) {
        await message.populate('replyTo', 'content sender timestamp');
      }

      // 대화의 마지막 메시지 업데이트 (이미 message post hook에서 처리됨)

      // 실시간 알림 발송 (Socket.IO)
      const otherParticipantId = conversation.getOtherParticipant(req.user._id);
      if (req.app.locals.io) {
        req.app.locals.io.to(otherParticipantId.toString()).emit('new_message', {
          conversationId: conversation._id,
          message: formatMessageForResponse(message),
        });
      }

      res.status(201).json({
        success: true,
        message: '메시지가 전송되었습니다.',
        data: {
          message: formatMessageForResponse(message),
        },
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: '메시지 전송 중 오류가 발생했습니다.',
      });
    }
  }
);

/**
 * @swagger
 * /api/chat/conversations/start:
 *   post:
 *     summary: 새 대화 시작 (매치 기반)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: 매치 ID
 *               initialMessage:
 *                 type: string
 *                 description: 첫 메시지 (선택사항)
 *     responses:
 *       201:
 *         description: 대화 시작 성공
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 매치를 찾을 수 없음
 */
router.post('/conversations/start', authenticate, requireVerified, async (req, res) => {
  try {
    const { matchId, initialMessage } = req.body;

    if (!matchId) {
      return res.status(400).json({
        success: false,
        error: '매치 ID가 필요합니다.',
      });
    }

    // 매치 조회 및 권한 확인
    const match = await Match.findById(matchId).populate('user1 user2');

    if (!match) {
      return res.status(404).json({
        success: false,
        error: '매치를 찾을 수 없습니다.',
      });
    }

    // 사용자가 이 매치의 참여자인지 확인
    const userId = req.user._id.toString();
    const isParticipant =
      match.user1._id.toString() === userId || match.user2._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: '이 매치에 대한 권한이 없습니다.',
      });
    }

    // 상호 매칭된 상태인지 확인
    if (match.status !== 'mutual_match') {
      return res.status(400).json({
        success: false,
        error: '상호 매칭된 경우에만 대화를 시작할 수 있습니다.',
      });
    }

    // 이미 대화가 존재하는지 확인
    const existingConversation = await Conversation.findByMatch(matchId);

    if (existingConversation) {
      return res.json({
        success: true,
        message: '이미 시작된 대화가 있습니다.',
        data: {
          conversation: {
            id: existingConversation._id,
            participants: existingConversation.participants,
            matchId: existingConversation.matchId,
            startedAt: existingConversation.startedAt,
          },
        },
      });
    }

    // 새 대화 생성
    const conversation = new Conversation({
      participants: [match.user1._id, match.user2._id],
      matchId: match._id,
      type: 'match',
    });

    await conversation.save();

    // 매치에 대화 정보 업데이트
    match.conversationStarted = true;
    match.conversationId = conversation._id;
    match.firstMessageAt = new Date();
    await match.save();

    // 초기 메시지가 있으면 전송
    let firstMessage = null;
    if (initialMessage && initialMessage.trim()) {
      firstMessage = new Message({
        conversationId: conversation._id,
        sender: req.user._id,
        content: initialMessage.trim(),
        type: 'text',
      });

      await firstMessage.save();
      await firstMessage.populate('sender', 'name profileImage');
    }

    // 대화 정보를 populate해서 반환
    await conversation.populate('participants', 'name profileImage lastActive');

    res.status(201).json({
      success: true,
      message: '대화가 시작되었습니다.',
      data: {
        conversation: {
          id: conversation._id,
          participants: conversation.participants.map(p => ({
            id: p._id,
            name: p.name,
            profileImage: p.profileImage,
            isOnline: p.isOnline,
            lastActive: p.lastActive,
          })),
          matchId: conversation.matchId,
          startedAt: conversation.startedAt,
          status: conversation.status,
        },
        firstMessage: firstMessage ? formatMessageForResponse(firstMessage) : null,
      },
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      error: '대화 시작 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/chat/messages/{id}/react:
 *   post:
 *     summary: 메시지에 이모지 반응 추가/제거
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메시지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 description: 이모지 유니코드
 *     responses:
 *       200:
 *         description: 반응 처리 성공
 */
router.post('/messages/:id/react', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        error: '이모지가 필요합니다.',
      });
    }

    const message = await Message.findById(req.params.id).populate(
      'conversationId',
      'participants'
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: '메시지를 찾을 수 없습니다.',
      });
    }

    // 대화 참여자인지 확인
    const isParticipant = message.conversationId.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: '이 대화의 참여자가 아닙니다.',
      });
    }

    // 반응 토글
    await message.toggleReaction(req.user._id, emoji);

    res.json({
      success: true,
      message: '반응이 처리되었습니다.',
      data: {
        reactions: message.reactions,
      },
    });
  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({
      success: false,
      error: '반응 처리 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/chat/conversations/{id}/typing:
 *   post:
 *     summary: 타이핑 상태 업데이트
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 대화 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isTyping
 *             properties:
 *               isTyping:
 *                 type: boolean
 *                 description: 타이핑 중인지 여부
 *     responses:
 *       200:
 *         description: 타이핑 상태 업데이트 성공
 */
router.post(
  '/conversations/:id/typing',
  authenticate,
  validateObjectId('id'),
  requireConversationParticipant,
  async (req, res) => {
    try {
      const { isTyping } = req.body;
      const conversation = req.conversation;

      if (typeof isTyping !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'isTyping은 boolean 값이어야 합니다.',
        });
      }

      // 타이핑 상태 업데이트
      await conversation.updateTypingStatus(req.user._id, isTyping);

      // 실시간 알림 (Socket.IO)
      if (req.app.locals.io) {
        const otherParticipantId = conversation.getOtherParticipant(req.user._id);
        req.app.locals.io.to(otherParticipantId.toString()).emit('typing_status', {
          conversationId: conversation._id,
          userId: req.user._id,
          isTyping,
          userName: req.user.name,
        });
      }

      res.json({
        success: true,
        message: '타이핑 상태가 업데이트되었습니다.',
      });
    } catch (error) {
      console.error('Update typing status error:', error);
      res.status(500).json({
        success: false,
        error: '타이핑 상태 업데이트 중 오류가 발생했습니다.',
      });
    }
  }
);

/**
 * @swagger
 * /api/chat/unread-count:
 *   get:
 *     summary: 읽지 않은 메시지 총 개수 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 읽지 않은 메시지 수 조회 성공
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    // 사용자의 모든 대화에서 읽지 않은 메시지 수 계산
    const conversations = await Conversation.find({
      participants: req.user._id,
      status: 'active',
    });

    let totalUnread = 0;
    for (const conv of conversations) {
      totalUnread += conv.getUnreadCount(req.user._id);
    }

    res.json({
      success: true,
      data: {
        totalUnread,
        conversationsWithUnread: conversations.length,
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: '읽지 않은 메시지 수 조회 중 오류가 발생했습니다.',
    });
  }
});

// 헬퍼 함수

function formatMessageForResponse(message) {
  return {
    id: message._id,
    content: message.content,
    type: message.type,
    sender: {
      id: message.sender._id,
      name: message.sender.name,
      profileImage: message.sender.profileImage,
    },
    timestamp: message.timestamp,
    isEdited: message.isEdited,
    editedAt: message.editedAt,
    reactions: message.reactions,
    replyTo: message.replyTo
      ? {
          id: message.replyTo._id,
          content: message.replyTo.content,
          sender: message.replyTo.sender,
          timestamp: message.replyTo.timestamp,
        }
      : null,
    attachments: message.attachments,
    readBy: message.readBy,
  };
}

module.exports = router;
