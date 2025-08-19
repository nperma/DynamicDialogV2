const dialogText = "hello everyone °(nice to meet you;2;dialogue.txt1)";

function calculateDialogTicks(textInput = dialogText) {
  const regex = /&\((.*?)(?:;(.*?))?\)|\+\((.*?);(\d+)(?:;(.*?))?\)|°\((.*?);(\d+)(?:;(.*?))?\)|./g;

  let totalTicks = 0;

  let match;
  while ((match = regex.exec(textInput)) !== null) {
    if (match[1]) {
      // &: Instant text (1 tick)
      totalTicks += 1;
    } else if (match[3] && match[4]) {
      // +: Timed text with specific tick delay
      totalTicks += parseInt(match[4]);
    } else if (match[6] && match[7]) {
      // °: Delayed text, per character with tick delay
      totalTicks += match[6].length * parseInt(match[7]);
    } else {
      // Default: Each character (1 tick)
      totalTicks += 1;
    }
  }

  return totalTicks;
}


console.log(`Total ticks: ${calculateDialogTicks()}`);
