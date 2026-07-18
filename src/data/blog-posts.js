import generatedPosts from "./generated/blog-posts.json";
import manualPosts from "./manual-blog-posts.json";
import recoveredPosts from "./cloudflare-recovered-blog-posts.json";
import currentPosts from "./current-blog-posts.json";

const authoredPosts = [...currentPosts, ...recoveredPosts, ...manualPosts];
const manualSlugs = new Set(authoredPosts.map((post) => post.slug).filter(Boolean));

export default [
  ...authoredPosts.filter((post, index) =>
    authoredPosts.findIndex((candidate) => candidate.slug === post.slug) === index),
  ...generatedPosts.filter((post) => !manualSlugs.has(post.slug))
].sort((a, b) => {
  const aDate = new Date(a.raw?.["Published On"] || 0).getTime();
  const bDate = new Date(b.raw?.["Published On"] || 0).getTime();
  return bDate - aDate;
});
