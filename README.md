# Rhythm-Interval Trainer

基于纯 HTML5 的移动端节奏间歇训练应用，支持自定义训练计划、节拍器、语音提示与后台运行方案。

## 功能亮点
- 多计划管理：创建/重命名/删除，数据持久化在 LocalStorage
- 训练层级：计划 → 训练组（循环次数） → 训练项（时长/BPM/间歇）
- 高精度节拍：优先使用 AudioWorklet（不可用时降级）
- 语音播报：Web Speech API 提示“下一项”
- 预设模板：内置 Tabata/慢跑/晨间力量，支持一键恢复
- 后台方案：静音音频占位 + Wake Lock

## 使用方式
建议使用本地服务或 HTTPS 访问，不要直接用 `file://` 打开：

```bash
# 在项目目录执行
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`（手机可通过同局域网 IP 访问）。

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
- `file://` 或非安全上下文下，AudioWorklet 可能不可用，后台节拍精度会下降
- Android Chrome + PWA 场景后台更稳定
- iOS Safari/Chrome 在后台可能被系统挂起，网页端无法保证完全连续播放
