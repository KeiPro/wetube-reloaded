const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    newComment.appendChild(icon);
    newComment.appendChild(span);
    videoComments.prepend(newComment);
}   

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

if(form){
    form.addEventListener('submit', handleSubmit);
}