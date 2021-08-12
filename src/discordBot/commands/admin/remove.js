const { updateGuide, findCategoryName, removeGroup, getRoleFromCategory } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole } = require("../../../../config.json");

/*
const printCourses = async () => {
  const courses = await Course.findAll();
  console.log("All courses in db:", JSON.stringify(courses, null, 2));
};
*/
const execute = async (interaction, client, Groups, Course) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  const courseString = findCategoryName(courseName, guild);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);

  const channelGeneral = guild.channels.cache.find(c => c.parent === category && c.name.includes("general"));

  if (!category) return sendEphemeral(client, interaction, `Invalid course name: ${courseName}.`);
  await Promise.all(guild.channels.cache
    .filter(c => c.parent === category)
    .map(async channel => await channel.delete()),
  );

  await category.delete();

  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${courseName} ${courseAdminRole}` || r.name === courseName))
    .map(async role => await role.delete()),
  );
  sendEphemeral(client, interaction, `Deleted course ${courseName}.`);
  await client.emit("COURSES_CHANGED");
  await updateGuide(client.guild);

  // Telegram db link remove
  if (channelGeneral) {
    const name = getRoleFromCategory(courseString);
    removeGroup(name, Groups);
  }

  // Database
  await Course.destroy({ where: { name: courseName } });
  // await printCourses();
};

module.exports = {
  name: "remove",
  description: "Delete course.",
  usage: "[course name]",
  role: "admin",
  options: [
    {
      name: "course",
      description: "Course to delete.",
      type: 3,
      required: true,
    },
  ],
  execute,
};
