document.addEventListener("DOMContentLoaded", function () {
    console.log("User channel....")
    const channelData = [
        "Channel-0:",
        "Channel-1:",
        "Channel-2:"
    ];

    const channelForm = document.getElementById("channelForm");
    const filenameInput = document.getElementById("filename");
    const channelOptions = document.getElementById("channelOptions");

    channelData.forEach((channelLabel, index) => {
        const channelRadio = document.createElement("input");
        channelRadio.type = "radio";
        channelRadio.name = "channel";
        channelRadio.value = index;

        const channelLabelElement = document.createElement("label");
        channelLabelElement.innerText = channelLabel;

        channelLabelElement.appendChild(channelRadio);
        channelOptions.appendChild(channelLabelElement);
    });

    channelForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const selectedChannel = document.querySelector('input[name="channel"]:checked');
        if (!selectedChannel) {
            alert("Please select a channel.");
            return;
        }

        const filename = "44153.tif";

        const channelValue = selectedChannel.value;
        
        try {
            const response = await fetch(`$../../multichannel/${filename}`, {
                method: "GET",
            });

            if (response.ok) {
                // Assuming you want to redirect to channel.html
                window.location.href = `/channel.html?filename=${filename}&channel_order=${channelValue}`;
            } else {
                alert("Error fetching data from the Docker service.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while fetching data.");
        }
    });
});
