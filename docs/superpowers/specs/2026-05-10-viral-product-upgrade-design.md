# 爆款产品升级设计

## Product Goal

这次升级把小程序从单次穿搭生成，推进到更容易反复打开、截图分享、和朋友互动的日常小玩具。首页不再只承载一个生成入口，而是形成三条清晰玩法：

- 经典 OOTD：延续现有“选场景 -> 抽穿搭”的低门槛主流程。
- OOTD with x：新增携崽、携喵、携汪出行，让穿搭结果拥有更强角色感和传播点。
- 今天吃什么：把出门后的餐饮决策也收进产品里，用投票和随机降低多人出门前的纠结。

首版仍然坚持 mock-first。重点不是一次性做完社交链路，而是先把“好玩、好看、可继续扩”的产品骨架搭稳。

## User Flows

### 经典 OOTD

用户进入首页，选择今天的场景，再点击“抽一套”。系统结合场景、天气、颜色、材质和小元素生成一套纸片人穿搭。

### OOTD with x

用户在首页切到 `OOTD with x`，从携崽、携喵、携汪中选一个，再按原场景生成。结果页保留人的穿搭，同时在纸片人旁边出现同行小搭子。小搭子也会拥有颜色、材质和配饰，例如小围兜、小领巾、小铃铛。

### 今天吃什么

用户从首页进入“今天吃什么”。页面默认创建一个本地饭局，参与者为“我、小桃、小薄荷”。每人给出 3 个候选餐饮，共 9 张菜牌。用户可以投票进入下一轮，也可以直接随机拍板。

## Data Model

### Outfit Companion

`generateOutfitForScene(sceneId, seedInput, weatherContext, companionMode)` 新增第四个可选参数。无参数时完全兼容旧行为。

当 `companionMode` 为 `崽 / 喵 / 汪` 时，返回结果增加：

- `companionMode`
- `companion`
- `companionOutfit`
- `companionSummary`

纸片人组件通过 `companion` 和 `companionOutfit` 渲染同行形象，不把 companion 混进人的衣服层级里。

### Food Session

`utils/food-service.js` 负责本地饭局状态：

- `createFoodSession(seed)` 创建三人九选项。
- `castVote(session, optionId, userName)` 写入投票。
- `advanceRound(session)` 将高票选项晋级。
- `pickRandom(source, seed)` 支持从 session 或 option list 中随机拍板。

这个模块先保持纯前端、可测试，未来可以平滑迁移到云函数或集合。

## UI Direction

首页新增轻量玩法 rail，不打断原有天气卡与横向场景卡。视觉仍沿用少女、清新、运营感文案，但入口要更像正式产品：经典穿搭负责稳定留存，with x 负责分享记忆点，吃什么负责多人场景扩展。

纸片人同行形象采用 CSS 模板，不引入新图片资源。崽、喵、汪都靠轮廓、耳朵、配饰和颜色区分，保持小而精，不喧宾夺主。

吃什么页面使用菜牌卡片和投票状态，减少解释文字，让用户看到卡片就能点。

## Future Phases

- 将 besties stage 与吃什么饭局合并为真实多人舞台。
- 给 OOTD with x 增加更多同行类型，例如携花、携相机、携娃娃。
- 分享海报加入 companion 和最终餐饮结果，形成“今天和谁出门 + 穿什么 + 吃什么”的完整出门小报。
- 增加云端房间和邀请链接，让闺蜜真实进入同一轮投票。
