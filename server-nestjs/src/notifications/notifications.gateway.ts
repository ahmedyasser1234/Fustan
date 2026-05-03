import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {

  }

  handleDisconnect(client: Socket) {

  }

  sendNotification(userId: string, data: any) {
    this.server.to(`user_${userId}`).emit('notification', data);
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, userId: string) {

    client.join(`user_${userId}`);
    return { event: 'joined', data: userId };
  }
}
