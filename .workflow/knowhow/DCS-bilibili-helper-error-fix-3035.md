---
title: "「出错了:("三连修v3.0.33-3.0.35: dash video-only降级+空data未登录判定+U空链接INVALID_RESPONSE真根因"
category: decision
createdBy: pi-agent
sourceRef: "repo:Smith-106/bilibili-helper,tag:v3.0.35"
---
背景: 用户报「出错了 :(」且两轮修复未解。取证源码.txt为未登录页(user.mid/isLogin undefined,videoData无dash/durl)。教训: **判定位置错了会白修**——v3.0.34在d0加!t.dash判定,但U内部o.dash||a.durl分支中r.video/r.audio空数组或m,p全undefined时仍返回code=OK+双undefined→s0走T(code:OK)→l0出错了。根因链: l0的code=OK分支dash&&durl全无时显示出错了。修复路径: v3.0.33 video-only降级durl=[video]+message空兜底; v3.0.34 d0空data判定; v3.0.35真根因——U内p(video流)存在即可下(video-only),a.durl非空可下,全空才INVALID_RESPONSE+登录态判定;support_formats缺时Object.values(c)TypeError改c||{}。U四场景模拟验证。方法论: 用户说"问题未解决"时, 直接取真源(源码/INITIAL_STATE)定位走到哪个分支, 不要猜。harness: A51-A55, verify71/acceptance16/selfcheck65全绿。
