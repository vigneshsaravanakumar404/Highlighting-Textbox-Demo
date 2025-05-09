import React, { useEffect, useRef } from 'react';


interface ChatComponentProps {
    messages: [string, string][];
}

export const ChatComponent = ({ messages }: ChatComponentProps) => {
    const messageContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom when new messages are added
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col w-full h-2/5 bg-white shadow-md">
            {/* Chat messages container - scrollable */}
            <div
                ref={messageContainerRef}
                className="flex flex-col p-4 h-96 overflow-y-auto"
            >
                {messages.map((message: [any, any], index: React.Key | null | undefined) => {
                    const [sender, content] = message;
                    const isUser = sender.toLowerCase() === 'user';

                    return (
                        <div
                            key={index}
                            className={`mb-4 max-w-md ${isUser ? 'self-end' : 'self-start'}`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg ${isUser
                                    ? 'bg-[#218AFF] text-white'
                                    : 'bg-[#D8D8D8] text-black'
                                    }`}
                            >
                                {content}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
