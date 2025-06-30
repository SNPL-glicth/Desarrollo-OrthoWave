import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class NotificationService {
    private client: Client;

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log('Conectado al servidor de notificaciones');
                this.subscribeToNotifications();
            },
            onDisconnect: () => {
                console.log('Desconectado del servidor de notificaciones');
            }
        });
    }

    connect(userId: string) {
        this.client.activate();
    }

    disconnect() {
        this.client.deactivate();
    }

    private subscribeToNotifications() {
        const userId = localStorage.getItem('userId');
        if (userId) {
            this.client.subscribe(`/user/${userId}/queue/notifications`, message => {
                const notification = JSON.parse(message.body);
                this.showNotification(notification);
            });
        }
    }

    private showNotification(notification: any) {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Orto-White', {
                        body: notification.message,
                        icon: '/logo.png'
                    });
                }
            });
        }
    }
}

export default new NotificationService(); 