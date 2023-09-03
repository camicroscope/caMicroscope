// https://developer.mozilla.org/en-US/docs/Web/API/Response/ok - to check the valid response

async function fetchData() {
  try {
    console.log("hello");
    const response = await fetch("../../multichannel/", {
      method: "GET",
    });
    if(response.ok){
      const data = await response.json();
      console.log("Working...inside:");
      console.log(data);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

async function imageData() {
  try {
    console.log("hello image");
    const response = await fetch("../../multichannel/44153.tif", {
      method: "GET",
    });
    const data = await response.json();
    console.log("Multi channel Image support")
    if (data.success) {
      console.log(data);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

fetchData();
imageData();