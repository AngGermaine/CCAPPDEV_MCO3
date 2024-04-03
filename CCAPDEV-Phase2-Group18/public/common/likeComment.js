$(document).ready(function(){
    const curUserId = getCurrentUserId();
    
    $(".reply").each(function(){
        const commentId = $(this).data("commentId");
        const ratings = $(this).find(".like-post-rating");
        const likeRating = ratings.eq(0);

        ratings.each(function(){
            const likeButton = $(this).find(".like-btn");
            const count = $(this).find(".like-count");

            likeButton.on("click", async function(){
                // Your existing code for liking comments
                if ($(this).parent().hasClass("like-post-rating-selected")) {
                    return;
                }
            
                count.text(Number(count.text()) + 1);
            
                ratings.each(function(){
                    if ($(this).hasClass("like-post-rating-selected")) {
                        const count = $(this).find(".like-count");
            
                        count.text(Math.max(0, Number(count.text()) - 1));
                        $(this).removeClass("like-post-rating-selected");
                    }
                });
            
                $(this).parent().addClass("like-post-rating-selected");
            
                const likeOrDislike = $(this).parent().is(likeRating) ? "like" : "dislike";
                const response = await fetch(`/comments/${commentId}/${likeOrDislike}`);
                const body = await response.json();
                likeComment(commentId);
            });
        });
    });
});

async function likeComment(commentId) {
    

    const userId = getCurrentUserId(); // Replace this with your method to get the current user's ID

    try {
        const response = await fetch('/like_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commentId: commentId, userId: userId })
        });

        if (response.ok) {
            console.log('Comment liked successfully.');
            // Update UI or perform other actions as needed
        } else {
            const errorMessage = await response.text();
            console.error(errorMessage);
            // Handle error message
        }
    } catch (error) {
        console.error('Error occurred while liking comment:', error);
        // Handle error
    }
}