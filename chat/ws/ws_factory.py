
from omnibus.factories import websocket_connection_factory

from chat.chat_management import Chat

def chat_ws_factory(auth_class, pubsub):
    # Generate a new connection class using the default websocket connection
    # factory (we have to pass an auth class - provided by the server and a
    # pubsub singleton, also provided by the omnibusd server
    class ChatWS(websocket_connection_factory(auth_class, pubsub)):

        def close_connection(self):
            return super(ChatWS, self).close_connection()

    # Return the generated connection class
    return ChatWS
