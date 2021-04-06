import { html, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';

export const Toast = ({icon, message, closeNotification, action}) => html`
    <div class="toast">
        ${icon && html`<div class="main-icon"><i class="material-icons">${icon}</i></div>`}
        <span class=${"message " + (action ? 'has-action' : '')} onclick=${() => action?.()}>${message}</span>
        <div class="close-icon" onclick=${closeNotification}><i class="material-icons">close</i></div>
    </div>
`;

export const NotificationContainer = ({notifications}) => {
    const [closed, setClosed] = useState([]);

    const close = (id) => setClosed([...closed, id])

    const filteredNotifications = notifications.filter(({id}) => !closed.includes(id))

    return html`
        <div class="notification-center">
            ${
                filteredNotifications.map(notification => Toast({...notification, key: notification.id, closeNotification: () => close(notification.id)}))
            }
        </div>
    `;
};