from gtts import gTTS

text = "欢迎回家，我一直都在等你，宝贝。"
tts = gTTS(text=text, lang='zh-cn')
tts.save("audio/dodva_welcome.mp3")
print("已生成：audio/dodva_welcome.mp3")
