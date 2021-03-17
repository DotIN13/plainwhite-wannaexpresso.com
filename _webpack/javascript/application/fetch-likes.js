export default () => {
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