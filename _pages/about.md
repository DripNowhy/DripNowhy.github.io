---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

# 👀 About Me
Hi! I'm a last-year undergraduate student from **School of Mathematics, Tianjin University**. Currently, I am an **research intern** at RZ-Lab, Purdue University, advised by **[<font color=DarkSlateBlue>Dr. Ruqi Zhang</font>](https://ruqizhang.github.io/)**. Meanwhile, I'm also a research assistant in the MLDM Lab **M**ultimodal **V**ision **P**rocessing (MVP) Group, advised by **[<font color=DarkSlateBlue>Dr. Bing Cao</font>](https://bcaosudo.github.io/)** and **[<font color=DarkSlateBlue>Prof. Qinghua Hu</font>](https://cic.tju.edu.cn/faculty/huqinghua/index.html)**. I am interested in building reliable machine learning algorithms/frameworks in the real world, especially on the alignment of Large Foundation Models (LLMs, VLMs) and the generalization of multimodal learning algorithms.

<span class='anchor' id='research-interests'></span>

# 💖 Research Interests
- **<font color=FireBrick>Multimodal Learning:</font>** **Multimodal Fusion, Imbalanced Multimodal Learning.**
- **<font color=FireBrick>Alignment of Foundation Models:</font>** **LLMs, VLMs.**
- **<font color=FireBrick>Trustworthy AI:</font>** **Safety, Uncertainty, etc.**

## **<font color=FireBrick>I'm finding 25 Fall PhD opportunities! You can find my</font> [<i class="fas fa-file-pdf" title="CV"></i>](../pdf/CV.pdf) <font color=FireBrick>here. If you share the same research interests with me, welcome to add my</font> [<i class="fab fa-weixin" title="Wechat"></i>](../images/wechat.jpg)**

<span class='anchor' id='news'></span>

# 🔥 News
- **[Oct. 2024]**: &nbsp;🎉🎉🎉 Our Paper about Inference Time Alignment of LVLMs is preprinted now. You can use our **[ETA](https://DripNowhy.github.io/ETA.html)** to safeguard your Large Vision Language Models (LVLMs)!
- **[Sep. 2024]**: &nbsp;🎉🎉🎉 Yi serves as Reviewer of ICLR 2025!
- **[Sep. 2024]**: &nbsp;🎉🎉🎉 Our paper about Dynamic Image Fusion without additional training is accepted to **NeurIPS 2024**! Congratulations to all Collaborators!
- **[Jul. 2024]**: &nbsp;🎉🎉🎉 Yi will make a poster presentation at Tue 23 Jul 1:30 p.m. — 3 p.m. on ICML Hall C 4-9 #2817, Vienna, Austria!
- **[May. 2024]**: &nbsp;🎉🎉🎉 Our paper about Multimodal Fusion is accepted to **ICML 2024**!

<span class='anchor' id='publications'></span>

# 📝 Publications & Preprints

\* indicates author with **equal contribution**.

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arXiv 2024</div><img src='images/ETA.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

**<font color=DarkSlateBlue style="font-size: 18px;">ETA: Evaluating Then Aligning Safety of Vision Language Models at Inference Time</font>**

<strong>Yi Ding</strong>, Bolian Li, Ruqi Zhang

**<font color=SandyBrown>TL;DR:</font>**  Establishing multimodal safety mechanism for VLMs and enhancing harmlessness and helpfulness of responses without additional training.

**<font color=DarkSlateBlue>Priprint.</font>**

[<i class="fas fa-file-pdf" aria-label="PDF"></i> PDF](https://arxiv.org/pdf/2410.06625)
[<i class="fas fa-globe" aria-label="Project Page"></i> Project](https://DripNowhy.github.io/ETA.html)
[<i class="fab fa-github" aria-label="Code"></i> Code](https://github.com/DripNowhy/ETA)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">NeurIPS 2024</div><img src='images/TTD.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

**<font color=DarkSlateBlue style="font-size: 18px;">Test-Time Dynamic Image Fusion</font>**

Bing Cao, Yinan Xia*, <strong>Yi Ding*</strong>, Changqing Zhang, Qinghua Hu

**<font color=SandyBrown>TL;DR:</font>** Improving quality of fused images of almost every backbones without additional training via setting dynamic weight in test-time.

**<font color=DarkSlateBlue>Neural Information Processing Systems (NeurIPS), 2024</font>**

[<i class="fas fa-file-pdf" aria-label="PDF"></i> [PDF]](https://arxiv.org/pdf/2411.02840)
[<i class="fab fa-github" aria-label="Code"></i> [Code]](https://github.com/Yinan-Xia/TTD)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICML 2024</div><img src='images/PDF.jpg' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

**<font color=DarkSlateBlue style="font-size: 18px;">Predictive Dynamic Fusion</font>**

Bing Cao, Yinan Xia*, <strong>Yi Ding*</strong>, Changqing Zhang, Qinghua Hu

**<font color=SandyBrown>TL;DR:</font>** The key to dynamic fusion lies in the correlation between the weights and the loss, providing generalization theory for decision-level fusion.

**<font color=DarkSlateBlue>International Conference on Machine Learning (ICML), 2024</font>**

[<i class="fas fa-file-pdf" aria-label="PDF"></i> PDF](https://arxiv.org/pdf/2406.04802)
[<i class="fas fa-quote-right" aria-label="Cite"></i> Cite](https://scholar.googleusercontent.com/...)
[<i class="fab fa-github" aria-label="Code"></i> Code](https://github.com/Yinan-Xia/PDF)

</div>
</div>

<span class='anchor' id='educations'></span>

# 📖 Educations
- *2021.08 - Present*, B.S., School of Mathematics, Tianjin University
- *2024.05 - Present*, Intern, Department of Computer Science, Purdue University 
