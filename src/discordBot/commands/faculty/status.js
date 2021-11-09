const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  getCourseNameFromCategory,
  createCourseInvitationLink,
  findCourseFromDb,
  findChannelsByCourse,
  isCourseCategory,
  downloadImage,
} = require("../../services/service");
const { editErrorEphemeral, sendEphemeral, editEphemeralForStatus } = require("../../services/message");
const { facultyRole } = require("../../../../config.json");


const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Fetching status...");
  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channelId);

  if (!isCourseCategory(channel?.parent)) {
    return await editErrorEphemeral(interaction, "This is not a course category, can not execute the command!");
  }

  const courseRole = getCourseNameFromCategory(channel.parent, guild);
  const course = await findCourseFromDb(courseRole, models.Course);

  const instructorRole = `${courseRole} instructor`;
  const count = guild.roles.cache.find(
    (role) => role.name === courseRole,
  )?.members.size;

  const instructors = guild.roles.cache.find(
    (role) => role.name === instructorRole,
  )?.members.map(m => m.displayName);

  const instructorMessage = (instructors && instructors.length) ?
    `${instructors.join(", ")}` :
    "No instructors";

  const channels = await findChannelsByCourse(course.id, models.Channel);

  const blockedChannels = channels
    .filter(c => !c.bridged)
    .map(c => c.name);

  const blockedChannelMessage = (blockedChannels && blockedChannels.length) ?
    `${blockedChannels.join(", ")}` :
    "No blocked channels";

  await downloadImage(course.name);

  return await editEphemeralForStatus(interaction, `
Course: ${course.name}
Fullname: ${course.fullName}
Code: ${course.code}
Hidden: ${course.private}
Invitation Link: ${createCourseInvitationLink(course.name)}
Bridge blocked on channels: ${blockedChannelMessage}

Instructors: ${instructorMessage}
Members: ${count}
  `);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Get full status of course.*")
    .setDefaultPermission(false),
  execute,
  usage: "/status",
  description: "Get full status of course.*",
  roles: ["admin", facultyRole],
};
