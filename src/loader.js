const fs = require("fs");
// const path = require("path");
const loader = (source) => {

  makeDirectorySafelyFactory("/tmp/dist/assets/styles");
  const filepath = "/tmp/dist/assets/styles/app.css";
  console.log("filepath", filepath);
  fs.writeFileSync(filepath, source);

  return source;
};

module.exports = loader;


const makeDirectorySafelyFactory =
  (path, { shouldEmpty } = { shouldEmpty: false }) => {
  const stat = fs.statSync(path, {
    throwIfNoEntry: false,
  })
  if (stat?.isDirectory() && !shouldEmpty) {
    return
  } else if (stat?.isDirectory() && shouldEmpty) {
    fs.rmSync(path, { recursive: true })
  }
  fs.mkdirSync(path, { recursive: true })
}
