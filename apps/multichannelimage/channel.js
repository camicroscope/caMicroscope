const channels = [
    { label: "Channel-0:", value: 0 },
    { label: "Channel-1:", value: 1 },
    { label: "Channel-2:", value: 2 }
];

function generateChannelOptions() {
    const channelOptionsDiv = document.getElementById("channelOptions");

    channels.forEach((channel, index) => {
        const channelDiv = document.createElement("div");
        const labelElement = document.createElement("p");
        labelElement.textContent = channel.label;
        channelDiv.appendChild(labelElement);

        ["Red", "Green", "Blue"].forEach(color => {
            const radioLabel = document.createElement("label");
            radioLabel.textContent = color;

            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = `channel_${index}`;
            radioInput.value = color;
            
            radioLabel.appendChild(radioInput);
            channelDiv.appendChild(radioLabel);
        });

        channelOptionsDiv.appendChild(channelDiv);
    });
}

document.getElementById("channelForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const selectedChannels = channels.map((channel, index) => {
        const selectedColor = document.querySelector(`input[name="channel_${index}"]:checked`);
        return selectedColor ? `${channel.label} ${selectedColor.value}` : null;
    }).filter(Boolean);

    const imagePreviewDiv = document.getElementById("imagePreview");
    imagePreviewDiv.innerHTML = selectedChannels.join("<br>");
});
generateChannelOptions();