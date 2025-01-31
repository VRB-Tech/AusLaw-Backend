import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from 'src/modules/chats/chats.service';
import { CreateChatDto } from 'src/modules/chats/dto/create.dto';
import { UpdateChatDto } from 'src/modules/chats/dto/update.dto';
import { CreateCommentDto } from 'src/modules/comments/dto/create.dto';
import { CreateReactionDto } from 'src/modules/comments/dto/createReaction.dto';
import { UpdateCommentDto } from 'src/modules/comments/dto/update.dto';
import { CommentsService } from 'src/modules/comments/services/comments.service';
import { ReactionsService } from 'src/modules/comments/services/reactions.service';
import { UpdateMessageDto } from 'src/modules/messages/dto/update.dto';
import { MessagesService } from 'src/modules/messages/messages.service';
import { CreatePostDto } from 'src/modules/posts/dto/create.dto';
import { PostsService } from 'src/modules/posts/posts.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 5 * 1024 * 1024,
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatsService: ChatsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  emitToClients(eventType: string, payload) {
    console.log(`Emitting event: ${eventType}`, payload);
    this.server.emit(eventType, payload);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: {
      chatId: number;
      userId: string;
      text: string;
      files?: string[];
    },
  ) {
    const { chatId, userId, text, files } = payload;

    const message = await this.messagesService.create({
      chatId,
      senderId: userId,
      content: text,
      files,
    });

    this.server.to(chatId.toString()).emit('receiveMessage', message);

    // const participants = await this.chatsService.getChatParticipants(chatId);

    // await Promise.all(
    //   participants.map(async (participantId) => {
    //     const unreadCount = await this.messagesService.getUnreadCount(
    //       participantId,
    //       chatId,
    //     );

    //     this.server
    //       .to(participantId.toString())
    //       .emit('unreadCount', { chatId, unreadCount });
    //   }),
    // );
  }

  @SubscribeMessage('readMessage')
  async handleReadMessage(
    client: Socket,
    payload: {
      chatId: number;
      messageId: number;
      userId: number;
    },
  ) {
    const { chatId, messageId, userId } = payload;

    await this.messagesService.updateMessageStatus(messageId, userId, 'read');

    this.server.to(chatId.toString()).emit('messageRead', { messageId });

    // const participants = await this.chatsService.getChatParticipants(chatId);

    // await Promise.all(
    //   participants.map(async (participantId) => {
    //     const unreadCount = await this.messagesService.getUnreadCount(
    //       participantId,
    //       chatId,
    //     );

    //     this.server
    //       .to(participantId.toString())
    //       .emit('unreadCount', { chatId, unreadCount });
    //   }),
    // );
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(
    client: Socket,
    payload: {
      messageId: number;
      updateMessageDto: UpdateMessageDto;
    },
  ) {
    const { messageId, updateMessageDto } = payload;

    const updatedMessage = await this.messagesService.update(messageId, updateMessageDto);

    this.server.emit('messageEdited', updatedMessage);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    client: Socket,
    payload: {
      messageId: number;
    },
  ) {
    const { messageId } = payload;

    await this.messagesService.remove(messageId);
    this.server.emit('messageDeleted', { messageId });
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, chatId: number) {
    client.join(chatId.toString());
  }

  @SubscribeMessage('createChat')
  async handleCreateChat(client: Socket, createChatDto: CreateChatDto) {
    const chat = await this.chatsService.create(createChatDto);
    this.server.emit('chatCreated', chat);
  }

  @SubscribeMessage('editChat')
  async handleEditChat(
    client: Socket,
    payload: {
      chatId: number;
      updateChatDto: UpdateChatDto;
    },
  ) {
    const { chatId, updateChatDto } = payload;

    const updatedChat = await this.chatsService.update(chatId, updateChatDto);
    this.server.emit('chatEdited', updatedChat);
  }

  @SubscribeMessage('deleteChat')
  async handleDeleteChat(
    client: Socket,
    payload: {
      chatId: number;
    },
  ) {
    const { chatId } = payload;

    await this.chatsService.remove(chatId);
    this.server.emit('chatDeleted', { chatId });
  }

  @SubscribeMessage('createPost')
  async handleCreatePost(client: Socket, payload: CreatePostDto) {
    const post = await this.postsService.create(payload);
    this.server.emit('postCreated', post);
  }

  @SubscribeMessage('editPost')
  async handleEditPost(
    client: Socket,
    payload: {
      postId: number;
      updatePostDto: UpdateCommentDto;
    },
  ) {
    const { postId, updatePostDto } = payload;

    const updatedPost = await this.postsService.update(postId, updatePostDto);

    this.server.emit('postEdited', updatedPost);
  }

  @SubscribeMessage('deletePost')
  async handleDeletePost(client: Socket, payload: { postId: number }) {
    const { postId } = payload;
    await this.postsService.remove(postId);
    this.server.emit('postDeleted', { postId });
  }

  @SubscribeMessage('likePost')
  async handleLikePost(client: Socket, payload: { postId: number; userId: number }) {
    const { postId, userId } = payload;

    const likedPost = await this.postsService.likePost(postId, userId);
    this.server.emit('postLiked', { postId, userId, likedPost });
  }

  @SubscribeMessage('unlikePost')
  async handleUnlikePost(client: Socket, payload: { postId: number; userId: number }) {
    const { postId, userId } = payload;

    const unlikedPost = await this.postsService.unlikePost(postId, userId);
    this.server.emit('postUnliked', { postId, userId, unlikedPost });
  }

  @SubscribeMessage('createComment')
  async handleCreateComment(
    client: Socket,
    payload: {
      createCommentDto: CreateCommentDto;
    },
  ) {
    const { createCommentDto } = payload;

    const comment = await this.commentsService.create(createCommentDto);

    console.log(comment);

    this.server.emit('commentCreated', comment);
  }

  @SubscribeMessage('editComment')
  async handleEditComment(
    client: Socket,
    payload: {
      commentId: number;
      updateCommentDto: UpdateCommentDto;
    },
  ) {
    const { commentId, updateCommentDto } = payload;

    const updatedComment = await this.commentsService.update(commentId, updateCommentDto);

    this.server.emit('commentEdited', updatedComment);
  }

  @SubscribeMessage('deleteComment')
  async handleDeleteComment(
    client: Socket,
    payload: {
      commentId: number;
    },
  ) {
    const { commentId } = payload;

    const comment = await this.commentsService.remove(commentId);

    console.log(comment);

    this.server.emit('commentDeleted', comment);
  }

  @SubscribeMessage('addReaction')
  async handleAddReaction(client: Socket, payload: CreateReactionDto) {
    const { commentId, userId, emoji } = payload;

    try {
      const reaction = await this.reactionsService.addReaction(commentId, userId.toString(), emoji);

      this.server.emit('reactionAdded', reaction);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('removeReaction')
  async handleRemoveReaction(
    client: Socket,
    payload: { commentId: number; userId: number; emoji: string },
  ) {
    const { commentId, userId, emoji } = payload;

    try {
      const reaction = await this.reactionsService.removeReaction(
        commentId,
        userId.toString(),
        emoji,
      );

      this.server.emit('reactionRemoved', reaction);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
