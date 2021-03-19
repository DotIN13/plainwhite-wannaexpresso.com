const removeHeartActions = function(heart) {
    heart.classList.add("active");
    heart.removeEventListener("mouseover", addActive);
    heart.removeEventListener("mouseleave", removeActive);
}

const addHeartActions = function(heart) {
    heart.classList.remove("active");
    heart.addEventListener("mouseover", addActive);
    heart.addEventListener("mouseleave", removeActive);
}

const removeActive = (e) => e.target.classList.remove("active");
const addActive = (e) => e.target.classList.add("active");

const postLike = function(e) {
    e.stopPropagation();
    // Animate heart after clicking
    e.target.classList.add("heart--animating");
    // Like if not liking, liking status shoud be set in dataset
    if (e.target.dataset.liked == "false") {
        // console.log("Liking")
        like(e.target)
    } else {
        // console.log("Deleting")
        like(e.target, true)
    }
}

const like = function(heart, cancel = false) {
    const cancelQuery = cancel ? "&cancel=1": ""
    fetch(`/api/like?article_id=${heart.dataset.like + cancelQuery}`).then((res) => {
        if (res.ok) {
            if (!cancel) removeHeartActions(heart);
            if (cancel) addHeartActions(heart);
            heart.dataset.liked = !cancel
            const count = Number(heart.closest(".meta-like").querySelector(".like-count").innerHTML) || 0;
            heart.closest(".meta-like").querySelector(".like-count").innerHTML = count + (cancel ? -1 : 1);
            
        }
    })
}

export const bindHeartActions = function() {
    document.querySelectorAll('.heart').forEach(el => {
        addHeartActions(el);
        el.addEventListener("click", postLike);
        el.addEventListener("animationend", (e) => e.target.classList.remove("heart--animating"));
    })
}

export const fetchLikes = function() {
    // Get all like buttons
    const likables = document.querySelectorAll(".heart");
    // Get all article IDs with like counts to retrieve
    const likableIds = Array.from(likables).map(h => h.dataset.like);

    fetch("/api/get_likes", {
            body: JSON.stringify(likableIds),
            method: "POST",
            contentType: "application/json"
        })
        .then((res) => res.json())
        .then((json) => {
            // console.log(json);
            likables.forEach(el => {
                const count = json[el.dataset.like].count;
                const liked = json[el.dataset.like].liked;
                if (count > 0) el.closest(".meta-like").querySelector(".like-count").innerHTML = count;
                if (liked) {
                    removeHeartActions(el);
                    el.dataset.liked = true
                }
            })
        });
}