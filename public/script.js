document.addEventListener("DOMContentLoaded", () => {
  // Connect to the Socket.IO server
  const socket = io(); // Connects to the server running on the same host and port

  const messageInput = document.getElementById("messageInput");
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const messagesDiv = document.getElementById("messages");

  const usernameInput = document.getElementById("usernameInput");
  const commentTextInput = document.getElementById("commentTextInput");
  const postCommentBtn = document.getElementById("postCommentBtn");
  const commentsDiv = document.getElementById("comments");
  const stars = document.querySelectorAll(".rating .star");

  let currentRating = 0; // Biến lưu trữ đánh giá hiện tại
  let mySocketId = null; // Store my own socket ID

  // --- Socket.IO Events ---

  // Get own socket ID when connected
  socket.on("connect", () => {
    mySocketId = socket.id;
    console.log("Connected to server with ID:", mySocketId);
  });

  // Load existing messages from the server
  socket.on("load_messages", (loadedMessages) => {
    messagesDiv.innerHTML = ""; // Clear existing messages
    loadedMessages.forEach((msg) =>
      displayMessage(msg.text, msg.senderId === mySocketId ? "me" : "other")
    );
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
  });

  // Receive new chat messages from the server
  socket.on("chat_message", (msg) => {
    displayMessage(msg.text, msg.senderId === mySocketId ? "me" : "other");
  });

  // Load existing comments from the server
  socket.on("load_comments", (loadedComments) => {
    commentsDiv.innerHTML = ""; // Clear existing comments
    // Comments are stored in reverse order on the server for display
    loadedComments.forEach((comment) =>
      displayComment(comment.username, comment.text, comment.rating)
    );
  });

  // Receive new comments from the server
  socket.on("new_comment", (comment) => {
    displayComment(comment.username, comment.text, comment.rating);
  });

  // --- Chức năng Trò chuyện ---

  // Hiển thị tin nhắn lên khung chat
  function displayMessage(message, type) {
    const messageItem = document.createElement("div");
    messageItem.classList.add("message-item", type);
    messageItem.textContent = message;
    messagesDiv.appendChild(messageItem);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Cuộn xuống tin nhắn mới nhất
  }

  // Gửi tin nhắn
  sendMessageBtn.addEventListener("click", () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
      // Emit the message to the server, including sender ID
      socket.emit("chat_message", { text: messageText, senderId: mySocketId });
      messageInput.value = "";
    }
  });

  // Cho phép gửi tin nhắn bằng phím Enter
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessageBtn.click();
    }
  });

  // --- Chức năng Bình luận & Đánh giá ---

  // Xử lý việc chọn sao đánh giá
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      currentRating = parseInt(star.dataset.value);
      stars.forEach((s, index) => {
        if (index < currentRating) {
          s.classList.add("selected");
        } else {
          s.classList.remove("selected");
        }
      });
    });
  });

  // Hiển thị bình luận
  function displayComment(username, text, rating) {
    const commentItem = document.createElement("div");
    commentItem.classList.add("comment-item");
    commentItem.innerHTML = `
            <strong>${username}</strong>
            <span class="comment-rating">${"⭐".repeat(rating)}</span>
            <p>${text}</p>
        `;
    commentsDiv.prepend(commentItem); // Thêm bình luận mới nhất lên đầu
  }

  // Đăng bình luận
  postCommentBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const commentText = commentTextInput.value.trim();

    if (username && commentText && currentRating > 0) {
      // Emit the new comment to the server
      socket.emit("new_comment", {
        username,
        text: commentText,
        rating: currentRating,
      });

      // Reset form
      usernameInput.value = "";
      commentTextInput.value = "";
      currentRating = 0;
      stars.forEach((s) => s.classList.remove("selected"));
    } else {
      alert("Vui lòng điền đầy đủ tên, bình luận và đánh giá sao!");
    }
  });
});
