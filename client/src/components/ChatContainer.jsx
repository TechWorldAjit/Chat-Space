import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import AISummaryModal from "./AISummaryModal";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    getGroupMessages,
    isAiTyping,
    summarizeGroup,
    isSummaryModalOpen,
    isSummaryLoading,
    summaryData,
    summaryGroupName,
    setIsSummaryModalOpen,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  const isGroup = selectedUser?.isGroup;

  const isSelectedUserAI =
    !isGroup &&
    (selectedUser?.isAI ||
      selectedUser?.email === "spaceai@system.local" ||
      selectedUser?.fullName === "SpaceAI");

  // Helper to format **bold** text inside chat messages
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // Handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      if (selectedUser.isGroup) {
        getGroupMessages(selectedUser._id);
      } else {
        getMessages(selectedUser._id);
      }
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && (messages || isAiTyping)) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiTyping]);

  return selectedUser ? (
    <div className="h-full overflow-hidden flex flex-col relative backdrop-blur-lg">
      {/* --------- header --------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500/60 justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          {isGroup ? (
            selectedUser.groupPic ? (
              <img
                src={selectedUser.groupPic}
                alt={selectedUser.name}
                className="w-9 h-9 rounded-full object-cover border border-violet-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white shadow">
                {selectedUser.name?.slice(0, 2).toUpperCase()}
              </div>
            )
          ) : (
            <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover"
            />
          )}

          {/* Name & Subtitle */}
          <div className="flex flex-col min-w-0">
            <p className="text-base font-medium text-white flex items-center gap-2 truncate">
              {isGroup ? selectedUser.name : selectedUser.fullName}
              {!isGroup &&
                (isSelectedUserAI || onlineUsers.includes(selectedUser._id)) && (
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                )}
            </p>
            <span className="text-xs text-gray-400 truncate">
              {isGroup
                ? `${selectedUser.members?.length || 0} members`
                : isSelectedUserAI
                ? "SpaceAI Assistant"
                : onlineUsers.includes(selectedUser._id)
                ? "Online"
                : "Offline"}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Summary Button (Group Chat) */}
          {isGroup && (
            <button
              onClick={() => summarizeGroup(selectedUser._id, selectedUser.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/50 to-violet-600/50 hover:from-purple-600/80 hover:to-violet-600/80 border border-violet-400/40 text-violet-100 text-xs font-medium transition-all shadow-sm cursor-pointer"
              title="Generate AI Summary"
            >
              <span>✨</span>
              <span className="max-sm:hidden">AI Summary</span>
            </button>
          )}

          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="arrow"
            className="md:hidden max-w-7 cursor-pointer"
          />
          <img
            src={assets.help_icon}
            alt="icon"
            className="max-md:hidden max-w-5 opacity-75 hover:opacity-100 cursor-pointer"
          />
        </div>
      </div>

      {/* --------- chat area --------- */}
      <div className="flex-1 overflow-y-scroll p-4 pb-4 flex flex-col gap-3">
        {messages.map((msg, index) => {
          const isMyMessage =
            msg.senderId === authUser?._id ||
            msg.senderId?._id === authUser?._id;

          const senderName = msg.senderId?.fullName || "Member";
          const senderPic =
            msg.senderId?.profilePic ||
            (isMyMessage ? authUser?.profilePic : null) ||
            assets.avatar_icon;

          return (
            <div
              key={msg._id || index}
              className={`flex items-end gap-2 justify-end ${
                !isMyMessage && "flex-row-reverse"
              }`}
            >
              <div className="flex flex-col max-w-[280px] md:max-w-[420px]">
                {/* Sender Name for incoming group messages */}
                {isGroup && !isMyMessage && (
                  <span className="text-[11px] font-semibold text-violet-300 mb-1 ml-1">
                    {senderName}
                  </span>
                )}

                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="attachment"
                    onClick={() => window.open(msg.image)}
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-95"
                  />
                ) : (
                  <p
                    className={`p-2.5 md:text-sm font-light rounded-2xl whitespace-pre-wrap break-words text-white ${
                      isMyMessage
                        ? "bg-gradient-to-r from-purple-500/60 to-violet-600/70 rounded-br-none"
                        : "bg-[#282142]/80 border border-violet-500/20 rounded-bl-none"
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </p>
                )}
              </div>

              {/* Avatar and Time */}
              <div className="text-center text-xs flex flex-col items-center">
                <img
                  src={senderPic}
                  alt={senderName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {/* SpaceAI Typing indicator */}
        {isAiTyping && isSelectedUserAI && (
          <div className="flex items-end gap-2 justify-end flex-row-reverse my-2">
            <div className="p-3 rounded-2xl rounded-bl-none bg-violet-500/20 text-violet-200 flex items-center gap-2 border border-violet-500/30">
              <span className="text-xs text-violet-300">SpaceAI is typing...</span>
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
            <div className="text-center text-xs">
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                alt="profile"
                className="w-6 h-6 rounded-full"
              />
              <p className="text-[10px] text-gray-400">AI</p>
            </div>
          </div>
        )}

        <div ref={scrollEnd}></div>
      </div>

      {/* --------- bottom input area --------- */}
      <div className="p-3 bg-black/10 border-t border-stone-600/30">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-gray-100/10 px-4 rounded-full border border-gray-600/40">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
              type="text"
              placeholder={
                isGroup
                  ? `Message ${selectedUser.name}...`
                  : "Send a message..."
              }
              className="flex-1 text-sm py-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
            />
            <input
              onChange={handleSendImage}
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
            />
            <label htmlFor="image">
              <img
                src={assets.gallery_icon}
                alt="gallery"
                className="w-5 mr-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              />
            </label>
          </div>
          <img
            onClick={handleSendMessage}
            src={assets.send_button}
            alt="send"
            className="w-8 cursor-pointer hover:scale-105 transition-transform"
          />
        </div>
      </div>

      {/* AI Summary Modal */}
      <AISummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summaryData={summaryData}
        isLoading={isSummaryLoading}
        groupName={summaryGroupName}
      />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-400 bg-white/5 max-md:hidden h-full">
      <img src={assets.logo_icon} alt="logo" className="max-w-16 opacity-80" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      <p className="text-xs text-gray-400">
        Select a conversation or group from the sidebar to begin chatting.
      </p>
    </div>
  );
};

export default ChatContainer;
