$(document).ready(function(){
    

    $(".reply").each(function(){
        const commentId = $(this).data("commentid");
        const ratings = $(this).find(".like-post-rating");
        const likeRating = ratings.eq(0);

        ratings.each(function(){
            const likeButton = $(this).find(".like-btn");
            const count = $(this).find(".like-count");

            likeButton.on("click", async function(){
                

                const likeOrDislike = $(this).parent().is(likeRating) ? "like" : "dislike";
                // console.log(commentId);
                // console.log(likeOrDislike);
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

                $.post('like_comment', {likeOrDislike: likeOrDislike, commentId:commentId}, 
                    function(data,status){
                        if(data.status==='success'){
                            
                        }
                    }
                );

                //const response = await fetch(`/comments/${commentId}/${likeOrDislike}`);
                //const body = await response.json();
                //likeComment(commentId);
            });
        });
    });
});

    // document.querySelectorAll(".comment-section .reply").forEach(comment => {
    //     const commentId = comment.dataset.commentId;
    //     const ratings = comment.querySelectorAll(".like-post-rating");
    //     const likeRating = ratings[0];

    //     ratings.forEach(rating => {
    //         const likeButton = rating.querySelector(".like-btn");
    //         const count = rating.querySelector(".like-count");

    //         likeButton.addEventListener("click", async () => {
    //             if (rating.classList.contains("like-post-rating-selected")) {
    //                 return;
    //             }

    //             count.textContent = Number(count.textContent) + 1;

    //             ratings.forEach(rating => {
    //                 if (rating.classList.contains("like-post-rating-selected")) {
    //                     const count = rating.querySelector(".like-count");

    //                     count.textContent = Math.max(0, Number(count.textContent) - 1);
    //                     rating.classList.remove("like-post-rating-selected");
    //                 }
    //             });

    //             rating.classList.add("like-post-rating-selected");

    //             const likeOrDislike = likeRating === rating ? "like" : "dislike";
    //             const response = await fetch(`/comments/${commentId}/${likeOrDislike}`);
    //             const body = await response.json();
    //         });
    //     });
    // });
// async function likeComment(commentId) {
    

//     const userId = fetch( '${loggedInUserId}'); // Replace this with your method to get the current user's ID

//     try {
//         const response = await fetch('/like_comment', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ commentId: commentId, userId: userId })
//         });

//         if (response.ok) {
//             console.log('Comment liked successfully.');
//             // Update UI or perform other actions as needed
//         } else {
//             const errorMessage = await response.text();
//             console.error(errorMessage);
//             // Handle error message
//         }
//     } catch (error) {
//         console.error('Error occurred while liking comment:', error);
//         // Handle error
//     }
// }