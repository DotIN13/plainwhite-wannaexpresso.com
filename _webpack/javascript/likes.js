export const likes = {
    removeActive: (e) => e.target.classList.remove("active"),
    addActive: (e) => e.target.classList.add("active"),
    like: function (e) {
        e.stopPropagation()
        // Animate heart after clicking
        e.target.classList.add("heart--animating")
        // Try to like article
        this.postLike(e.target)
    },
    bindHeartActions: function () {
        document.querySelectorAll('.heart').forEach(el => {
            el.addEventListener("click", this.like.bind(this))
            el.addEventListener("animationend", (e) => e.target.classList.remove("heart--animating"))
            el.addEventListener("mouseover", this.addActive)
            el.addEventListener("mouseleave", this.removeActive)
        })
    },
    removeHeartActions: function (heart) {
        heart.removeEventListener("mouseover", this.addActive)
        heart.removeEventListener("mouseleave", this.removeActive)
        heart.removeEventListener("click", this.like.bind(this))
    },
    postLike: function (heart) {
        fetch(`/api/like?article_id=${heart.dataset.like}`).then((res) => {
            if (res.ok) {
                heart.classList.add("active")
                this.removeHeartActions(heart)
                const count = Number(heart.closest(".meta-like").querySelector(".like-count").innerHTML) || 0
                heart.closest(".meta-like").querySelector(".like-count").innerHTML = count + 1
            }
        })
    },
    fetch: () => {
        // Get all like buttons
        const likables = document.querySelectorAll(".heart")
        // Get all article IDs with like counts to retrieve
        const likableIds = Array.from(likables).map(h => h.dataset.like)

        fetch("/api/get_likes", {
                body: JSON.stringify(likableIds),
                method: "POST",
                contentType: "application/json"
            })
            .then((res) => res.json())
            .then((json) => {
                // console.log(json)
                likables.forEach(el => {
                    const count = json[el.dataset.like].count
                    if (count > 0) el.closest(".meta-like").querySelector(".like-count").innerHTML = count
                })
            })
    }
}