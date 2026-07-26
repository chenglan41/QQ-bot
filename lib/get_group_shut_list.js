
fetch(`http://127.0.0.1:${process.argv[2]}/get_group_shut_list`, {
   method: "POST",
   headers: {
    "Authorization": `Bearer ${process.argv[3]}`,
    "Content-Type": "application/json"
   },
   body: JSON.stringify({
    "group_id": process.argv[4]
})
})
   .then((response) => response.text())
   .then((result) => console.log(result))
   .catch((error) => console.error(error));