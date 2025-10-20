import React from 'react'
import Editor from '@monaco-editor/react'

const Edit = () => {
    const code = "console.log('Hello')"
    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                theme="vs-dark"
                options={{ minimap: { enabled: false } }}
            />
        </div>
    )
}

export default Edit


// {
//     messages.map((msg, idx) => {
//         const isCurrentUser = msg.sender === user?.username;
//         return (
//             <div
//                 key={idx}
//                 className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
//             >
//                 {/* Sender name */}
//                 <span className={`text-xs mb-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-200'}`}>
//                     {msg.sender}
//                 </span>

//                 {/* Message bubble */}
//                 <div
//                     className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${isCurrentUser
//                         ? 'bg-blue-500 text-white rounded-br-none'
//                         : 'bg-gray-300 text-gray-900 rounded-bl-none'
//                         }`}
//                 >
//                     {msg.text}
//                 </div>
//             </div>
//         );
//     })
// }