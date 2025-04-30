const pkg = require("whatsapp-web.js");
const crypto = require("crypto");

const { Poll } = pkg;

async function handleAssignments(client, contactId, assignments) {
  try {
    if (assignments.length === 0) {
      await client.sendMessage(
          contactId,
          "There are no assignments to display."
      );
    } else if (assignments.length === 1) {
      await client.sendMessage(
          contactId,
          `You have one assignment: ${assignments[0]}`
      );
      // return assignments[0];
    } else {
      return await createAssignmentPoll(client, contactId, assignments, 0);
    }
  } catch (error) {
    console.error("Error handling assignments:", error);
  }
}

async function createAssignmentPoll(
    client,
    contactId,
    assignments,
    startIndex
) {
  return new Promise((resolve, reject) => {
    try {
      const maxOptions = 3;
      const endIndex = Math.min(startIndex + maxOptions, assignments.length);
      const currentAssignments = assignments.slice(startIndex, endIndex);
      const pollOptions = currentAssignments;

      if (endIndex < assignments.length) {
        pollOptions.push("Load More");
      }
      if (startIndex > 0) {
        pollOptions.push("Go Back");
      }

      const poll = new Poll("Which assignment did you work on?", pollOptions, {
        allowMultipleAnswers: false,
      });

      client.sendMessage(contactId, poll).then((sentMessage) => {
        const responseHandler = async (vote) => {
          if (vote.parentMessage.id.id === sentMessage.id.id) {
            const selectedOption = vote.selectedOptions[0].name;
            if (selectedOption === "Load More") {
              await createAssignmentPoll(client, contactId, assignments, endIndex).then(resolve);
            } else if (selectedOption === "Go Back") {
              await createAssignmentPoll(client, contactId, assignments, startIndex - maxOptions).then(resolve);
            } else {
              await client.sendMessage(contactId, `You've selected: ${selectedOption}`);
              const selectedAssignment = {
                selectedOption: selectedOption,
                contactId: contactId,
              };
              resolve(selectedAssignment);
            }
          }
        };

        client.on("vote_update", responseHandler);
      }).catch(reject);

      console.log("Poll sent successfully!");
    } catch (error) {
      console.error("Error creating poll:", error);
      reject(error);
    }
  });
}

module.exports = {
  handleAssignments
};