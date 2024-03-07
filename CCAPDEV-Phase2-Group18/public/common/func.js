$(document).ready(function(){
    //View Cafe
    for(let i =1;i<=5;i++){
        $("#likebtn-"+i).click(function(){
            $.post('view-cafe'),{},
                function(data,status){
                    if(status==='success'){
                        let likeCount = Number($("likecount-"+i).text()) + 1;
                        $("review"+i).text(likeCount);
                    }
                }
        });

        $("#dislikebtn-"+i).click(function(){
            $.post('view-cafe'),{},
                function(data,status){
                    if(status==='success'){
                        let likeCount = Number($("dislikecount-"+i).text()) + 1;
                        $("review"+i).text(likeCount);
                    }
                }
        });
    }
    
});