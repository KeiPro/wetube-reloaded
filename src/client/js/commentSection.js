const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const videoComments = document.querySelector(".video__comments ul");
const deleteButtons = videoComments.querySelectorAll(".delete-comment");

const handleSubmit = async (event) => {

    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const {id} = videoContainer.dataset;
    if(text === ""){
        return;
    }
    const response = await fetch(`/api/videos/${id}/comment`, {
        method:"POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({text})
    });

    if(response.status === 201){
        textarea.value = "";
        const {newCommentId} = await response.json();
        addComment(text, newCommentId);
    }
};

const addComment = (text, id) => {
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const deleteButton = document.createElement("span");
    deleteButton.innerText = "X";
    deleteButton.className = "delete-comment";

    deleteButton.addEventListener('click', (event) => deleteComment(event, id));

    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(deleteButton);
    videoComments.prepend(newComment);
}

const deleteComment = async (event, commentId) => {
    const {id} = videoContainer.dataset;
    const response = await fetch(`/api/videos/${id}/delete?commentId=${commentId}`, {
        method:"DELETE"
    });

    const DELETE_COMPLETE = 200;
    if(response.status === DELETE_COMPLETE){
        console.log("삭제 완료.");
        event.target.parentElement.remove();
    }
}

if(deleteButtons){
    deleteButtons.forEach(button => {
        const {id} = button.parentElement.dataset;
        button.addEventListener('click', (event) => deleteComment(event, id));
    });
}

if(form){
    form.addEventListener('submit', handleSubmit);
}