async function fetchData() {
  try {
    console.log("hello");
    
    const response = await fetch("../../multichannel/", {
      method: "GET",
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(data);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

// Call the async function to fetch the data
fetchData();
