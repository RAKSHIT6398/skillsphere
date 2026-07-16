// routes/chat.js
router.delete("/conversations/:id", auth, async (req, res) => {
  await Conversation.findByIdAndDelete(req.params.id);
  res.json({ message: "Conversation deleted" });
});