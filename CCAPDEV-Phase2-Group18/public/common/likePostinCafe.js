$(document).ready(function(){
    document.querySelectorAll(".review-container").forEach(review => {
        const postId = review.getAttribute("post-id");
        

        review.querySelectorAll(".like-post-rating").forEach(rating => {
            const likeButton = rating.querySelector(".like-btn");
            const count = rating.querySelector(".like-count");
            const likeRating = review.querySelector(".like-post-rating");
            likeButton.addEventListener("click", async () => {
                likePost(postId, likeRating, rating, count);
                //const response = await fetch(`/posts/${postId}/${likeOrDislike}`);
                //const body = await response.json();
            });
        });
    });
});

async function likePost(postId, likeRating, rating, count) {
    if (rating.classList.contains("like-post-rating-selected")) {
        return;
    }

    count.textContent = Number(count.textContent) + 1;

    document.querySelectorAll(".like-post-rating").forEach(rating => {
        if (rating.classList.contains("like-post-rating-selected")) {
            const count = rating.querySelector(".like-count");

            count.textContent = Math.max(0, Number(count.textContent) - 1);
            rating.classList.remove("like-post-rating-selected");
        }
    });

    rating.classList.add("like-post-rating-selected");

    const likeOrDislike = likeRating === rating ? "like" : "dislike";
    
}