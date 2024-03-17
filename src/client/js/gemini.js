const chatForm = document.querySelector(".chat-form");
const messageSpan = document.querySelector(".gemini-message span");
const submitButton = chatForm.querySelector("button[type='submit']");

console.log("submit이 불렸습니다!");

chatForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    console.log("submit이 불렸습니다!");
    const formData = new FormData(chatForm);
    const message = formData.get("message");

    // 버튼을 비활성화하여 추가 전송을 방지
    submitButton.disabled = true;
    submitButton.textContent = "Sending..."; // 사용자에게 상태 피드백 제공

    // 서버에 메시지 전송 및 응답 받기
    try {
        const response = await fetch("/users/gemini", {
            method: "POST",
            body: JSON.stringify({ message: message }),
            headers: {
            'Content-Type': 'application/json'
            },
          });

        const responseData = await response.json();
        if (responseData && responseData.reply) {
            const htmlContent = marked.parse(responseData.reply); // 마크다운을 HTML로 변환
            messageSpan.innerHTML = htmlContent; // innerHTML을 사용하여 내용 삽입
        } else {
             messageSpan.textContent = "No response.";
        }

        // 입력 필드 초기화
        chatForm.reset();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // 요청 처리가 완료되면 버튼을 다시 활성화
        submitButton.disabled = false;
        submitButton.textContent = "Send";
    }
});
  