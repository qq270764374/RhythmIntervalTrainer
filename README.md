# Rhythm-Interval Trainer

基于纯 HTML5 的移动端节奏间歇训练应用，支持自定义训练计划、节拍器、语音提示与后台运行方案。

## 功能亮点
- 多计划管理：创建/重命名/删除，数据持久化在 LocalStorage
- 训练层级：计划 → 训练组（循环次数） → 训练项（时长/BPM/间歇）
- 高精度节拍：Web Audio API `currentTime` 调度
- 语音播报：Web Speech API 提示“下一项”
- 预设模板：内置 Tabata/慢跑/晨间力量，支持一键恢复
- 后台方案：静音音频占位 + Wake Lock

## 使用方式
直接用浏览器打开 `index.html` 即可使用。建议在移动端 Chrome/Safari 中体验。

## 训练项字段说明
- 动作名称：用于显示与语音播报
- 时长(秒)：该动作持续时间
- BPM：节拍速度（每分钟点击次数）
- 间歇(秒)：动作结束后的休息时间

## 技术说明
- Web Audio API：节拍器与点击音效
- Web Speech API：语音提示
- LocalStorage：计划数据持久化
- Wake Lock：防止熄屏影响训练

## 注意事项
- 首次点击“开始”会触发音频权限请求
- 部分浏览器可能限制后台运行效果
