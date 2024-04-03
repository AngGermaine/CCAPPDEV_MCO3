$(document).ready(function(){
    $(".post-info").each(function(){
        const postId = $(this).data("postId");
        const ratings = $(this).find(".like-post-rating");
        const likeRating = ratings.eq(0);

        ratings.each(function(){
            const likeButton = $(this).find(".like-btn");
            const count = $(this).find(".like-count");

            likeButton.on("click", async function(){
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
                //const response = await fetch(`/posts/${postId}/${likeOrDislike}`);
                //const body = await response.json();
            });
        });
    });
});