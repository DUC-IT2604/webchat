document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("messageInput");
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const messagesDiv = document.getElementById("messages");

  const usernameInput = document.getElementById("usernameInput");
  const commentTextInput = document.getElementById("commentTextInput");
  const postCommentBtn = document.getElementById("postCommentBtn");
  const commentsDiv = document.getElementById("comments");
  const stars = document.querySelectorAll(".rating .star");

  let currentRating = 0; // Biến lưu trữ đánh giá hiện tại

  // --- Chức năng Trò chuyện ---

  // Tải tin nhắn đã lưu (nếu có)
  function loadMessages() {
    const storedMessages =
      JSON.parse(localStorage.getItem("chatMessages")) || [];
    storedMessages.forEach((msg) => displayMessage(msg.text, msg.type));
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Cuộn xuống cuối
  }

  // Hiển thị tin nhắn lên khung chat
  function displayMessage(message, type = "sent") {
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
      displayMessage(messageText, "sent");
      saveMessage(messageText, "sent");
      messageInput.value = "";

      // (Tùy chọn) Mô phỏng tin nhắn trả lời từ "người khác"
      setTimeout(() => {
        const reply = "Chào bạn! Mình nhận được tin nhắn của bạn rồi.";
        displayMessage(reply, "received");
        saveMessage(reply, "received");
      }, 1000);
    }
  });

  // Lưu tin nhắn vào Local Storage
  function saveMessage(message, type) {
    const storedMessages =
      JSON.parse(localStorage.getItem("chatMessages")) || [];
    storedMessages.push({ text: message, type: type });
    localStorage.setItem("chatMessages", JSON.stringify(storedMessages));
  }

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

  // Tải bình luận đã lưu (nếu có)
  function loadComments() {
    const storedComments =
      JSON.parse(localStorage.getItem("websiteComments")) || [];
    storedComments.forEach((comment) =>
      displayComment(comment.username, comment.text, comment.rating)
    );
  }

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
      displayComment(username, commentText, currentRating);
      saveComment(username, commentText, currentRating);
      // Reset form
      usernameInput.value = "";
      commentTextInput.value = "";
      currentRating = 0;
      stars.forEach((s) => s.classList.remove("selected"));
    } else {
      alert("Vui lòng điền đầy đủ tên, bình luận và đánh giá sao!");
    }
  });

  // Lưu bình luận vào Local Storage
  function saveComment(username, text, rating) {
    const storedComments =
      JSON.parse(localStorage.getItem("websiteComments")) || [];
    storedComments.unshift({ username, text, rating }); // Thêm vào đầu mảng
    localStorage.setItem("websiteComments", JSON.stringify(storedComments));
  }

  // Khởi tạo: tải dữ liệu khi trang tải xong
  loadMessages();
  loadComments();
});
