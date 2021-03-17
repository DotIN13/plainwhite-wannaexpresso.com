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
                const number = document.createElement("div")
                number.innerHTML = json[el.dataset.like].count
                el.nearest(".mood-meta").appendChild(number)
            })
        })
}