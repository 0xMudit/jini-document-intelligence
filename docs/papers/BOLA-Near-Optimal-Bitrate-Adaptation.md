# BOLA-Near-Optimal-Bitrate-Adaptation

- **Source file:** BOLA-Near-Optimal-Bitrate-Adaptation.pdf
- **Pages:** 15
- **Creation date:** D:20200619023426Z

---

<!-- page 1 -->

1
BOLA: Near-Optimal Bitrate Adaptation
for Online Videos
Kevin Spiteri1, Rahul Urgaonkar 2, Ramesh K. Sitaraman1
1University of Massachusetts at Amherst, 2Amazon Prime Video
{kspiteri,ramesh}@cs.umass.edu, urgaonka@amazon.com
Abstract—Modern video players employ complex algorithms
to adapt the bitrate of the video that is shown to the user.
Bitrate adaptation requires a tradeoff between reducing the
probability that the video freezes (rebuffers) and enhancing the
quality of the video. A bitrate that is too high leads to frequent
rebuffering, while a bitrate that is too low leads to poor video
quality. Video providers segment videos into short segments
and encode each segment at multiple bitrates. The video player
adaptively chooses the bitrate of each segment to download,
possibly choosing different bitrates for successive segments. We
formulate bitrate adaptation as a utility-maximization problem
and devise an online control algorithm called BOLA that uses
Lyapunov optimization to minimize rebuffering and maximize
video quality. We prove that BOLA achieves a time-average
utility that is within an additive term O(1/V ) of the optimal
value, for a control parameter V related to the video buffer size.
Further, unlike prior work, BOLA does not require prediction of
available network bandwidth. We empirically validate BOLA in
a simulated network environment using a collection of network
traces. We show that BOLA achieves near-optimal utility and in
many cases signiﬁcantly higher utility than current state-of-the-
art algorithms. Our work has immediate impact on real-world
video players and for the evolving DASH standard for video
transmission. We also implemented an updated version of BOLA
that is now part of the standard reference player dash.js and is
used in production by several video providers such as Akamai,
BBC, CBS, and Orange.
Index Terms—Internet Video, Video Quality, Adaptive Bitrate
Streaming, Lyapunov Optimization, Optimal Control
I. INTRODUCTION
Online videos are the “killer” application of the Internet
with videos currently accounting for more than half of the
Internet trafﬁc. Video viewership is growing at a torrid pace
and videos are expected to account for more than 85% of all
Internet trafﬁc within a few years [2]. As all forms of tradi-
tional media migrate to the Internet, video providers face the
daunting challenge of providing a good quality of experience
(QoE) for users watching their videos. Video providers are
diverse and include major media companies (e.g., NBC, CBS),
news outlets (e.g., CNN), sports organizations (e.g., NFL,
MLB), and video subscription services (e.g., Netﬂix, Hulu).
Recent research has shown that low-performing videos that
start slowly, play at lower bitrates, and freeze frequently can
cause viewers to abandon the videos or watch fewer minutes
This work was supported in part by the NSF under Grant CNS-1413998
and Grant CNS-1901137. A ﬁnal version of this paper appears in IEEE/ACM
Transactions on Networking 2020 [1].
of the videos, signiﬁcantly decreasing the opportunity for gen-
erating revenue for the video providers [3]–[5], underscoring
the need for a high-quality user experience.
Providing a high-quality experience for video users requires
balancing two contrasting requirements. The user would like
to watch the highest-quality version of the video possible,
where video quality can be quantiﬁed by the bitrate at which
the video is encoded. For instance, watching a movie in high
deﬁnition (HD) encoded at 2 Mbps arguably provides a better
user experience than watching the same movie in standard
deﬁnition (SD) encoded at a bitrate of 800 kbps. In fact,
there is empirical evidence that the user is more engaged
and watches longer when the video is presented at a higher
bitrate. However, it is not always possible for users to watch
videos at the highest encoded bitrate, since the bandwidth
available on the network connection between the video player
on the user’s device and the video server constrains what
bitrates can be watched. In fact, choosing a bitrate that is
higher than the available network bandwidth1 will lead to
video freezes in the middle of the playback, since the rate
at which the video is being played exceeds the rate at which
the video can be downloaded. Such video freezes are called
rebuffers and playing the video continuously without rebuffers
is a key factor in the QoE perceived by the user [4]. Thus,
balancing the contrasting requirements of playing videos at a
high bitrate while at the same time avoiding rebuffers is central
to providing a high-quality video watching experience.
A. Adaptive Bitrate (ABR) Streaming
Achieving a high QoE for video streaming is a major
challenge due to the sheer diversity of video-capable devices
that include smartphones, tablets, desktops, and televisions.
Further, the devices themselves can be connected to the
Internet in a multitude of ways, including cable, ﬁber, DSL,
WiFi and mobile wireless, each providing different bandwidth
characteristics. The need to adjust the video playback to the
characteristics of the device and the network has led to the
evolution of adaptive bitrate (ABR) streaming that is now the
de facto standard for delivering videos on the Internet.
ABR streaming requires that each video is partitioned into
segments, where each segment corresponds to a few seconds
of play. Each segment is then encoded in a number of different
bitrates to accommodate a range of device types and network
1 Throughout this paper, we say bandwidth when talking about network
throughput and bitrate when talking about encoding quality.
arXiv:1601.06748v3  [cs.NI]  18 Jun 2020



<!-- page 2 -->

2
connectivities. When the user plays a video, the video player
can download each segment at a bitrate that is appropriate
for the available bandwidth of the network connection. Thus,
the player can switch to a segment with a lower bitrate when
the available bandwidth is low to avoid rebuffering. If more
bandwidth becomes available at a future time, the player can
switch back to a higher bitrate to provide a richer experience.
The video player has a buffer that allows it to fetch and
store segments before they need to be rendered on the screen.
Thus, the video player can tolerate brief network disruptions
without interrupting the playback of the user by using the
buffered segments. A large disruption, however, will empty
the buffer, resulting in rebuffering. The decision of which
segments to download at what bitrates is made by a bitrate
adaptation algorithm within the video player, the design of
such algorithms being the primary focus of our work.
Several popular implementations of ABR streaming exist,
including Apple’s HTTP Live Streaming (HLS) [6], Mi-
crosoft’s Live Smooth Streaming (Smooth) [7] and Adobe’s
Adaptive Streaming (HDS) [8]. Each has its own proprietary
implementation and slight modiﬁcations to the basic ABR
technique described above. A key recent development is
a unifying open-source standard for ABR streaming called
MPEG-DASH [9]. DASH is broadly similar to the other ABR
protocols and is a particular focus in our empirical evaluation.
B. Our Contributions
Our primary contribution is a principled approach to the
design of bitrate adaptation algorithms for ABR streaming.
In particular, we formulate bitrate adaptation as a utility
maximization problem that incorporates both key components
of QoE: the average bitrate of the video experienced by the
user and the duration of the rebuffer events. An increase in the
average bitrate increases utility, whereas rebuffering decreases
it. A strength of our framework is that utility can be deﬁned in
a very general manner, say, depending on the content, video
provider, or user device.
Using Lyapunov optimization, we derive an online bitrate
adaptation algorithm called BOLA (Buffer Occupancy based
Lyapunov Algorithm) that provably achieves utility that is
within an additive factor of the maximum possible utility in
the large video regime. While numerous bitrate adaptation
algorithms have been proposed [10]–[15] and implemented
within video players, our algorithm is the ﬁrst to provide a
theoretical guarantee on the achieved utility. Further, BOLA
provides an explicit knob for video providers to set the relative
importance of a high video quality in relation to the probability
of rebuffering.
While not an explicit part of the Lyapunov optimization
framework, we also show how BOLA can be adapted to
avoid frequent bitrate switches during video playback. Bitrate
switches are arguably less annoying than rebuffering, but it
is still of some concern to video providers and users alike if
such switches occur too frequently.
Most algorithms implemented in practice use a bandwidth-
based approach where the available bandwidth between the
server and the video player is predicted and the predicted
value is used to determine the bitrate of the next segment
that is to be downloaded. A complementary approach is a
buffer-based approach that does not predict the bandwidth,
but only uses the amount of data that is currently stored
in the buffer of the video player. Recently, there has been
empirical evidence that a buffer-based approach has desirable
properties that bandwidth-based approaches lack and has been
adopted by Netﬂix [11]. An intriguing outcome of our work
is that the optimal algorithm within our utility maximization
framework requires only knowledge of the amount of data in
the buffer and no estimate of the available bandwidth. Thus,
our work provides the ﬁrst theoretical justiﬁcation for why
buffer-based algorithms perform well in practice and adds new
insights to the ongoing debate [14] within the video streaming
and DASH standards communities of relative efﬁcacy of the
two approaches. Further, since our algorithm BOLA is buffer-
based, it avoids the overheads of more complex bandwidth
prediction present in current video player implementations
and is more stable under bandwidth ﬂuctuations. Note that
our results imply that the buffer level is a sufﬁcient statistic
that indirectly provides all information about past bandwidth
variations required for choosing the next bitrate.
We also empirically evaluate BOLA on a wide set of
network traces that include 12 test cases provided by the
DASH industry forum [16] and 85 publicly-available 3G
mobile bandwidth traces [17]. As a benchmark for comparison,
we develop an optimal ofﬂine algorithm that uses dynamic
programming and is guaranteed to produce the maximum
achievable time-average utility for any given set of network
traces. Unlike BOLA that works in an online fashion, the
ofﬂine optimal algorithm makes decision based on perfect
knowledge of future bandwidth variations. Remarkably, the
utility achieved by BOLA is within 84–95% of ofﬂine optimal
utility for all the tested traces.
Besides comparing BOLA with the ofﬂine optimal, we also
empirically compared our algorithm with four state-of-the-art
algorithms proposed in the literature. In all test cases, BOLA
achieved a utility that is as good as or better than the best
state-of-the-art algorithm.
We also implemented BOLA in dash.js, the open-source
standard DASH reference player [18]. Deploying BOLA in
production required a number of adjustments [19]. Through
dash.js, BOLA is now being used in production by several
major video providers and delivery networks such as Akamai,
BBC, CBS and Orange. BOLA is available as an option to
commercial video providers who often use the production
dash.js reference implementation for building their own video
players. Further, a second algorithm called DYNAMIC [19] is
also available for commercial video providers. DYNAMIC is
a hybrid algorithm that uses a simple throughput-estimation
approach during the start-up phase of the video and then uses
BOLA afterwards. Both algorithms can be evaluated in a web
browser by clicking the “Show Options” button in the latest
version of the dash.js reference player found at [18].
II. SYSTEM MODEL
Our system model closely captures how ABR streaming
works on the Internet today. We consider a video player that



<!-- page 3 -->

3
downloads a video ﬁle from a server over the Internet and
plays it back to the user. The video ﬁle is segmented into
segments that are downloaded in succession. The available
bandwidth between the server and the player varies over time.
This can be due to reasons such as network congestion and
wireless fading among others. The viewing experience of the
user is determined by both the video quality as quantiﬁed
by the bitrates of the segments that are played back and the
playback characteristics such as rebuffering. The objective
of the player is to maximize a utility associated with the
user’s viewing experience while adapting to time-varying (and
possibly unpredictable) changes in the available bandwidth.
Video Model: The video ﬁle is segmented into N segments
indexed as {1, 2, . . . , N} where each segment represents p
seconds of the video. On the server, each segment is available
in M different bitrates where a segment encoded at a higher
bitrate has a larger size in bits and its playback provides a
better user experience and higher utility. Suppose the size (in
bits) of any2 segment encoded at bitrate index m is Sm bits and
suppose the utility derived by the user from viewing it is given
by υm where m ∈{1, 2, . . . , M}. WLOG, let the segment
bitrates be non-decreasing in index m. Then, the following
holds.
υ1 ≤υ2 ≤. . . ≤υM ⇐⇒S1 ≤S2 ≤. . . ≤SM.
(1)
Note that the actual encoding bitrate for bitrate index m is
given by Sm/p bits/second.
Video Player: The video player downloads successive seg-
ments of the video ﬁle from the server and plays back the
downloaded segments to the user. Each segment must be
downloaded in its entirety before it can be played back.
We assume that the player sends requests to the server to
download one segment at a time. Also, the segments are
downloaded in the same order as they are played back. The
video player has a ﬁnite buffer of size Qmax segments3
to store the downloaded but yet-to-be-played-back segments.
Measuring the buffer in segments is equivalent to measuring
it in seconds since the segment duration p is ﬁxed. If the
buffer is full the player cannot download any new segments
and waits for a ﬁxed period of time given by ∆seconds before
attempting to download a new segment. The segments that
are fully downloaded are played back at a ﬁxed rate of 1/p
segments/second without any idling.
When sending a download request for a new segment, the
player also speciﬁes the desired bitrate for that segment. This
enables the player to tradeoff the overall video quality with
the likelihood of rebuffering that occurs when there are no
segments in the buffer for playback. Note that while each
segment has a ﬁxed playback time of p seconds, the size of
the segment (in bits) can be different depending on its bitrate.
Thus, the choice of bitrate for a segment impacts its download
time.
2For simplicity, we assume that the segment size (in bits) is Sm for all
segments of a given bitrate index m. However, our framework can be easily
extended to the case where the segment size for the same bitrate can vary
across segments.
3It is common practice for video players to measure the buffer in seconds
of playback time rather than in bits.
Network Model: The available bandwidth (in bits/second)
between the server and player is assumed to vary continuously
in time according to a stationary random process ω(t). We
do not make any assumptions about knowing the statistical
properties or probability distribution of ω(t) except that it has
ﬁnite ﬁrst and second moments as well as a ﬁnite inverse
second moment. Suppose the player starts to download a
segment of bitrate index m at time t. Then the time t′ when
the download ﬁnishes satisﬁes the following:
Sm =
Z t′
t
ω(τ)dτ
(2)
Let E {ω(t)} = ωavg. Then, E {t′ −t} = Sm/ωavg.
III. PROBLEM FORMULATION
We consider two primary performance metrics4 that affect
the overall QoE of the user: (1) time-average playback quality
which is a function of the bitrates of the segments viewed
by the user and (2) fraction of time spent not rebuffering. To
formalize these metrics, we consider a time-slotted represen-
tation of our system model. The timeline is divided into non-
overlapping consecutive slots of variable length and indexed
by k ∈{1, 2, . . .}. Slot k starts at time tk and is Tk = tk+1−tk
seconds long. We assume that t1 = 0. At the beginning of each
slot, the video player makes a control decision on whether it
should start downloading a new segment, and if yes, its bitrate.
If a download decision is made, then a request is sent to the
server and the download starts immediately5. This download
takes Tk seconds and is completed at the end of slot k. Note
that Tk is a random variable whose actual value depends on
the realization of the ω(t) process as well as the choice of
segment bitrate. If the player decides not to download a new
segment in slot k (for example, when the buffer is full), then
this slot lasts for a ﬁxed duration of ∆seconds.
We deﬁne the following indicator variable for each slot k:
am(tk) =



1
if the player downloads a segment
of bitrate index m in slot k, and
0
otherwise.
(3)
Then, for all k, we must have PM
m=1 am(tk) ≤1. Moreover,
when PM
m=1 am(tk) = 0, then no segments are downloaded.
Denote the buffer level (measured in number of segments)
at the start of slot k by Q(tk). The dynamics of this queue
can be expressed using the following equation:
Q(tk+1) = max[Q(tk) −Tk
p , 0] +
M
X
m=1
am(tk)
(4)
Here, the arrival value into this queue in slot k is given by
PM
m=1 am(tk) which is 1 if a download decision is made in
slot k and 0 otherwise. The departure value is Tk/p which
represents the total number of segments (including fractional
segments) that could have departed the buffer in slot k. Note
4We do not include the secondary objective of avoiding frequent bitrate
switches in our formulation, but we deal with it empirically in Section V-E.
5Any delays associated with sending the request can be added to the overall
download time.



<!-- page 4 -->

4
that the actual value of Tk is revealed at the end of slot k.
Also note that a segment that is downloaded in slot k becomes
available for playback only from the next slot. We assume that
the buffer level is initialized to 0, i.e., Q(t1) = 0.
Let KN denote the index of the slot in which the N th (i.e.,
last) segment is downloaded. Also, denote the time at which
the player ﬁnishes playing back the last segment by Tend. Then
the ﬁrst performance metric of interest is the time-average
expected playback utility υN which is deﬁned as
υN
△=
E
nPKN
k=1
PM
m=1 am(tk)υm
o
E {Tend}
(5)
where the numerator denotes the expected total utility across
all N segments. Note that a segment can only be played
back after it has been downloaded entirely. Thus, Tend is
greater than the last segment’s download ﬁnish time, i.e.,
Tend > tKN + TKN .
The second performance metric of interest is the expected
fraction of time sN that is spent not rebuffering and can be in-
terpreted as a measure of the average playback “smoothness”.
This can be calculated by observing that the actual playback
time for all N segments is Np seconds. Thus, the expected
playback smoothness sN is given by
sN
△=
Np
E {Tend} =
E
nPKN
k=1
PM
m=1 am(tk)p
o
E {Tend}
(6)
where in the last step we use the relation that Np
=
PKN
k=1
PM
m=1 am(tk)p. Note that Tend ≥Np (since at most
one segment can be played back at any time), so that sN ≤1.
A. Design Objective
We want to design a control algorithm that maximizes the
joint utility υN + γsN subject to the constraint that Q(tk) ≤
Qmax for all k. Here, γ > 0 is an input weight parameter for
prioritizing playback utility versus the playback smoothness.
This problem can be formulated as a stochastic optimization
problem with a time-average objective over a ﬁnite horizon and
dynamic programming (DP) based approaches can be used to
solve it [20]. However, traditional DP based methods have
two major disadvantages. First, they require knowledge of the
distribution of the ω(t) process which may be hard to obtain.
Second, even when such knowledge is available, the resulting
DP can have a very large state space. This is because the state
space for this problem under a DP formulation would consist
of not only the timeslot index k and value tk, but also the
buffer size Q(tk). Further, an appropriate discretization of the
ω(t) process would be required to obtain a tractable solution.
In order to overcome the above challenges associated with
traditional DP based methods, we take an alternate approach
in this paper. First, we consider the bitrate adaptation problem
in the limiting regime when the video size becomes large, i.e.,
N →∞. Second, we replace the ﬁnite buffer constraint with
a rate stability constraint (made precise in the next section).
The reason for making these assumptions is that it results
in simpliﬁcations to the original problem as discussed in the
next section. This allows us to develop a bitrate adaptation
algorithm that does not require any knowledge of the dis-
tribution of ω(t), yet offers provable theoretical performance
guarantees in the large video size regime while satisfying the
ﬁnite buffer constraint. As shown later in Section V-D, with
slight modiﬁcations, this algorithm can be used for ﬁnite sized
videos as well and offers close to optimal performance in our
experiments.
B. Problem Relaxation
Consider the bitrate adaptation problem in the limiting
regime when the video size becomes large, i.e., N →∞.
Then, the metrics υN and sN can be expressed as
υ △= lim
N→∞υN = lim
N→∞
E
nPKN
k=1
PM
m=1 am(tk)υm
o
E {Tend}
=
lim
KN→∞
1
KN E
nPKN
k=1
PM
m=1am(tk)υm
o
lim
KN→∞
1
KN E
nPKN
k=1 Tk
o
(7)
s △= lim
N→∞sN = lim
N→∞
E
nPKN
k=1
PM
m=1 am(tk)p
o
E {Tend}
=
lim
KN→∞
1
KN E
nPKN
k=1
PM
m=1 am(tk)p
o
lim
KN→∞
1
KN E
nPKN
k=1 Tk
o
(8)
This follows by noting that the difference between the ex-
pected total playback ﬁnish time E {Tend} and the expected
total download ﬁnish time E
nPKN
k=1 Tk
o
is upper bounded by
a ﬁnite value due to the ﬁnite Qmax. Speciﬁcally, this upper
bound is given by Qmaxp. Therefore, instead of considering
the total playback ﬁnish time, we can consider the total
download ﬁnish time in the objective when the video size
becomes large.
Next, replace the ﬁnite buffer constraint with a rate stability
constraint [21]. This constraint only requires that the time-
average arrival rate into the buffer cannot exceed the time-
average playback rate. This is equivalent to requiring that
lim
KN→∞
1
KN
E
(KN
X
k=1
M
X
m=1
am(tk)p
)
≤
lim
KN→∞
1
KN
E
(KN
X
k=1
Tk
)
(9)
The rate stability constraint is a relaxation of the ﬁnite buffer
constraint since any policy that ensures ﬁnite buffers is always
rate stable but not vice versa. Therefore, under this relaxation,
the optimal time-average utility cannot be smaller than the
optimal time-average utility with the ﬁnite buffer constraint.
With these relaxations, our performance objective for the
bitrate adaptation problem is to maximize the joint utility υ +
γs subject to the rate stability constraint (9).Let us denote the
optimal time-average utility for this problem by υ∗+γs∗. This
problem ﬁts in the framework of Lyapunov optimization for
renewal systems [22].Speciﬁcally, this framework extends the
original Lyapunov optimization technique [21] to systems with
variable length renewal frames and shows that minimizing a
“drift-plus-penalty” ratio over every frame yields an optimal



<!-- page 5 -->

5
control algorithm. We refer to [22] for details on this method.
In the context of our bitrate adaptation problem, the variable
length slots represent the renewal frames.
The following characterization can be made about the
optimality of i.i.d. algorithms.
Lemma 1: For the bitrate adaptation problem in the limiting
regime when the video size becomes large, i.e., N →∞,
there exists a buffer-state-independent stationary algorithm
that makes i.i.d. control decisions in every slot and satisﬁes the
rate stability constraint while achieving time-average utility no
smaller than υ∗+ γs∗.
Proof: This follows from Lemma 1 in [22] and uses the
fact that the conditional expectations and conditional second
moments of the frame length and utility are bounded under
any algorithm. The full proof is omitted for brevity.
Note that such a buffer-state-independent stationary algo-
rithm is not necessarily feasible for our ﬁnite buffer system.
Further, calculating it explicitly would require knowledge of
the distribution of ω(t). However, instead of calculating this
policy explicitly, we will use its existence and characterization
per Lemma 1 to design an online control algorithm using the
technique of Lyapunov optimization over renewal frames.
In the next section, we will present this algorithm and show
that it meets the ﬁnite buffer constraint while achieving a time-
average utility that is within O(1/Qmax) of υ∗+ γs∗without
requiring any knowledge of the distribution of ω(t).
IV. BOLA: AN ONLINE CONTROL ALGORITHM
We ﬁrst give a high-level intuition of the Lyapunov op-
timization over renewals technique. This technique converts
the problem of optimizing the time-average metrics in (7)–(8)
subject to the time-average constraint in (9) into a series of per
slot optimization problems. The problem to be solved in each
slot involves minimizing a ratio of the expected drift-plus-
penalty value in that slot to the expected length of the slot. As
shown in the Appendix, this can be done without requiring
any knowledge of the distribution of ω(t). The drift term
consists of E

(Q(tk+1)2 −Q(tk)2)/2 | Q(tk)
	
and serves to
meet the rate stability constraint (9). The penalty term consists
of the playback utility and playback smoothness received in
that slot. We keep the utility and smoothness as separate terms
even though they can be folded into one metric. This allows
us to tune the relative importance of increasing video bitrate
and reducing rebuffering without changing the algorithm. The
algorithm uses a control parameter V > 0 to allow a tradeoff
between the buffer size and the performance objectives.
We now present the algorithm. In every slot k, given the
buffer level Q(tk) at the start of the slot, our algorithm makes
a control decision by solving the following deterministic
optimization problem. Let
ρ(tk, a(tk)) =













0
if PM
m=1 am(tk) = 0,
PM
m=1 am(tk)
 V υm + V γp −Q(tk)

PM
m=1 am(tk)Sm
otherwise.
(10)
Then determine a(tk) by solving the optimization problem:
Maximize:
ρ(tk, a(tk))
Subject to:
PM
m=1 am(tk) ≤1, am(tk) ∈{0, 1}
(11)
The constraints of this problem result in a very simple
solution structure. Speciﬁcally, the optimal solution is given
by:
1) If Q(tk) > V (υm + γp) for all m ∈{1, 2, . . . , M}, then
the no-download option is chosen, i.e., am(tk) = 0 for
all m. Note that in this case Tk = ∆.
2) Else, the optimal solution is to download the next segment
at bitrate index m∗where m∗is the index that maximizes
the ratio
 V υm + V γp −Q(tk)

/Sm among all m for
which this ratio is positive.
Notice that solving this problem does not require any
knowledge of the ω(t) process. Further, the optimal solution
depends only on the buffer level Q(tk). That’s why we call
our algorithm BOLA: Buffer Occupancy based Lyapunov Algo-
rithm. These properties of BOLA should be contrasted with the
bandwidth prediction based strategies that have been recently
proposed for this problem that require explicit prediction of
the available bandwidth for control decisions.
The following theorem characterizes the theoretical perfor-
mance guarantees provided by BOLA.
Theorem 1: Suppose BOLA as deﬁned by (11) is imple-
mented in every slot using a control parameter 0 < V ≤
Qmax−1
υM+γp . Assume Q(0) = 0. Then, the following hold.
1) The queue backlog satisﬁes Q(tk) ≤V (υM + γp) + 1
for all slots k. Further, the buffer occupancy in segments
never exceeds Qmax.
2) The time-average utility achieved by BOLA satisﬁes
υBOLA + γsBOLA ≥υ∗+ γs∗−p2 + Ψ
2p2V
(12)
where Ψ is an upper bound on E

T 2
k
	
under any control
algorithm and is assumed to be ﬁnite.
Proof: See the Appendix.
Remarks: The performance bounds in Theorem 1 show a
[O(1/V ), O(V )] utility and backlog tradeoff that is typical
of Lyapunov based control algorithms for similar utility max-
imization problems. Speciﬁcally, the time-average utility of
BOLA is within an O(1/V ) additive term of the optimal utility
and this gap may be made smaller by choosing a larger value
of V . However, the largest feasible value of V is constrained
by the buffer size and there is a linear relation between them.
A. Understanding BOLA With an Example
We now present a sample run to illustrate how BOLA works.
We slice a 99-second video using 3-second segments and
encode it at ﬁve different bitrates. While BOLA only requires
the utilities to be a non-decreasing function of the segment
bitrate, it is natural to consider concave utility functions with
diminishing returns, e.g., a 1 Mbps increase in segment bitrate
likely provides a larger utility gain for the user when that
increase is from 0.5 Mbps to 1.5 Mbps than when it is from
5 Mbps to 6 Mbps. A natural choice for our example is



<!-- page 6 -->

6
 0
 2x10-7
 4x10-7
 6x10-7
 8x10-7
 1x10-6
 0
 5
 10
 15
 20
 25
ρ = (Vυ + Vγp - Q) / S
buffer level (s)
6.0 Mbps
3.0 Mbps
1.4 Mbps
0.7 Mbps
0.3 Mbps
thresholds
Fig. 1. The value of (V υm + V γp −Q)/Sm for different bitrates depends
on buffer level. (γp = 5 and V = 0.93.) Note that the buffer level is Qp
seconds.
 0
 1
 2
 3
 4
 5
 6
 0
 5
 10
 15
 20
 25
bitrate (Mbps)
buffer level (s)
bitrate
thresholds
Fig. 2. BOLA’s bitrate choice as function of buffer level. (γp = 5,V = 0.93.)
Note that the buffer level is Qp seconds.
the logarithmic utility function: let υm = ln(Sm/S1). Pick
γ = 5.0/p and V = 0.93. The bitrates and utilities are below.
bitrate (Mbps)
0.331
0.688
1.427
2.962
6.000
S (Mb)
0.993
2.064
4.281
8.886
18.00
υ
0.000
0.732
1.461
2.192
2.897
For any slot we choose the segment bitrate to maximize
(V υm + V γp −Q)/Sm for 1 ≤m ≤M. Fig. 1 shows the
relationship between the expression and the buffer level Q for
different m. The line intersections mark the buffer levels that
correspond to decision thresholds. Fig. 2 summarizes BOLA’s
bitrate choices as a function of the buffer level.
Fig. 3 shows how BOLA works. We use a synthetic network
bandwidth proﬁle as shown in Fig. 3(a). We can see the
feedback loop involving the bitrate in (a) and the buffer level
in (b). BOLA chooses the bitrate based directly on the buffer
level using Fig. 2. The bitrate affects the download time, thus
it indirectly affects the buffer level at the beginning of the
following slot. Finally, when all the segments are downloaded,
the video player plays out the segments remaining in the
buffer.
B. Choosing Utility and Parameters γ and V
While we chose a logarithmic utility function for the exam-
ple, a video provider can use any utility function satisfying (1).
 0
 1
 2
 3
 4
 5
 6
 7
 8
 9
 0
20
40
60
80
100
(a)  bitrate (Mbps)
time (s)
download bitrate
network bandwidth
encoded bitrates
 0
 5
10
15
20
25
 0
20
40
60
80
100
(b)  buffer level (s)
time (s)
buffer level
decision thresholds
Fig. 3. Sample video download and playback using BOLA. (a) The video is
encoded at 5 different bitrates. The network bandwidth varies from high to
low and back to high. The downloaded segment bitrate adapts to the network
bandwidth. (b) The buffer level variation triggers bitrate changes when it
crosses the thresholds.
The utility function might also take into account system
characteristics such as the type of device a viewer is using.
γ corresponds to how strongly we want to avoid rebuffering.
Increasing γ translates the graphs in Figs. 1 and 2 to the right,
effectively shifting the thresholds higher without changing
their relative distance. BOLA will thus download more low-
bitrate segments to maintain a larger (and safer) buffer level.
Increasing V expands the graphs in Figs. 1 and 2 horizon-
tally about the origin. If we have a maximum buffer level Qmax
we want to avoid downloading unless there is enough space for
one full segment on the buffer, that is unless Q ≤Qmax −1.
For a given Qmax we can set V = (Qmax −1)/(υM + γp).
While we showed how to choose reasonable values for γ
and V , video providers are more familiar with choosing buffer
level targets. A method to derive the parameters from buffer
level targets is included in Section VI-B. Alternatively, video
providers might choose γ and V by employing an approach
such as Oboe [23] to auto-tune the BOLA parameters.
V. IMPLEMENTATION AND EMPIRICAL EVALUATION
We ﬁrst implemented a basic version of BOLA, named
BOLA-BASIC, directly from (11). Recall that when the buffer
level is full BOLA does not download a segment but waits
for ∆seconds. Rather than picking an arbitrary value for ∆,
we use a dynamic wait until Q(tk) ≤V (υM + γp). This
has the same effect as picking a ﬁxed but very small ∆,
so the theoretical analysis still holds. We also implemented



<!-- page 7 -->

7
TABLE I
BITRATES USED FOR BIG BUCK BUNNY TEST VIDEO
Bitrate
Bitrate (Mbps)
Segment Size S (Mb)
Utility
Index
Mean
Standard
Mean
Standard
υ
m
Deviation
Deviation
= ln(S/S1)
1
0.230
0.038
0.690
0.113
0.000
2
0.331
0.054
0.993
0.162
0.364
3
0.477
0.096
1.431
0.287
0.729
4
0.688
0.120
2.064
0.360
1.096
5
0.991
0.182
2.973
0.545
1.461
6
1.427
0.275
4.281
0.825
1.825
7
2.056
0.394
6.168
1.182
2.190
8
2.962
0.564
8.886
1.691
2.556
9
5.027
0.891
15.08
2.673
3.084
M = 10
6.000
1.078
18.00
3.232
3.261
TABLE II
NETWORK PROFILES FOR THE DASH BENCHMARKS
1
3
5
7
9
11
Mbps (ms)
Mbps (ms)
Mbps (ms)
Mbps (ms)
Mbps (ms)
Mbps (ms)
5.0 ( 38)
5.0 ( 13)
5.0 (11)
4.0 ( 50)
4.0 ( 18)
4.0 (13)
9.0 ( 25)
9.0 ( 10)
9.0 ( 6)
3.0 ( 75)
3.0 ( 28)
3.0 (15)
4.0 ( 50)
4.0 ( 50)
4.0 (13)
2.0 ( 88)
2.0 ( 58)
2.0 (20)
2.0 ( 75)
2.0 (150)
2.0 (20)
1.5 (100)
1.5 (200)
1.5 (25)
1.0 (100)
1.0 (200)
1.0 (25)
2.0 ( 88)
2.0 ( 58)
2.0 (20)
2.0 ( 75)
2.0 (150)
2.0 (20)
3.0 ( 75)
3.0 ( 28)
3.0 (15)
4.0 ( 50)
4.0 ( 50)
4.0 (13)
4.0 ( 50)
4.0 ( 18)
4.0 (13)
other versions of BOLA, namely BOLA-FINITE, BOLA-O,
and BOLA-U, that we describe later in this section.
A. Test Methodology
We simulated all versions of BOLA using the Big Buck
Bunny movie [24]. The 10-minute movie was encoded at 10
different bitrates and sliced in 3-second segments. Although
each quality index has a speciﬁed average bitrate, segments
may have variable bitrate (VBR) because of the varying nature
of the movie. We simulate playback times longer than 10 min-
utes by repeating the movie. Again we choose a logarithmic
utility function: υm = ln(Sm/S1). Table I shows the mean
and standard deviation of the bitrate and segment size for each
quality index and the respective utility values.
The DASH Industry Forum provides benchmarks for various
aspects of the DASH standard [16]. The benchmarks include
twelve different network proﬁles. Proﬁles 1–6 have network
bandwidths ranging from 1.5 to 5 Mbps while proﬁles 7–12
have bandwidths ranging from 1 to 9 Mbps. Different latencies
are provided for each bandwidth, where the latency is half
the round-trip time (RTT). Table II shows the odd-numbered
bandwidth characteristics. Proﬁle 1 spends 30s at each of 5,
4, 3, 2, 1.5, 2, 3 and 4 Mbps respectively, then starts back at
the top. Even-numbered proﬁles are similar to the preceding
odd-numbered proﬁles but start at the low bandwidth stage.
For example, proﬁle 2 starts at 1.5 Mbps.
In addition, we also tested our algorithms using a set of 86
3G mobile bandwidth traces that are publicly available [17].
One trace was excluded because it had an average bandwidth
of 80 kbps; our lowest video bitrate is 230 kbps. Since the
traces do not include latency measurements, we used 50 ms
latency giving a RTT of 100 ms throughout. This is the median
RTT measured empirically in [25].
1: r(0, t, b) ←{0 for t = b = 0, −∞otherwise}
2: for n in [1, N] do
3:
initialize r(n, t, b) ←−∞for all t, b
4:
for all (t′, b′) such that r(n −1, t′, b′) > −∞do
5:
for m in [1, M] do
6:
x ←download time(n, t′, m)
7:
xδ ←⌊x/δ⌋· δ
8:
x′
δ ←max[xδ, b′ + p −bmax]
9:
y ←max[x′
δ −b′, 0]
10:
t ←t′ + x′
δ
11:
b ←b′ −x′
δ + y + p
12:
r′ ←r(n −1, t′, b′) + υm −γy
13:
r(n, t, b) ←max[r(n, t, b), r′]
14:
end for
15:
end for
16: end for
17: r∗←max
(t,b)
r(N, t, b)
(t + b)
Fig. 4. Calculating the Ofﬂine Optimal Utility Upper Bound
B. Computing an Upper Bound on the Maximum Utility
In order to evaluate how well BOLA performs on the traces,
it is important to derive an upper bound on the maximum
utility that is obtainable by any algorithm on a given trace. We
derive an ofﬂine optimal algorithm that provides the maximum
achievable utility using dynamic programming. We deﬁne a
table r(n, t, b) that contains the maximum utility possible
when we download the nth segment and ﬁnish at time t with
buffer level b. We initialize the table with r(0, 0, 0) = 0. Let
x(n, t, m) be the time to download the nth segment at bitrate
index m starting at time t. Note that the dependency of x on
n is due to VBR. We quantize the time with granularity δ.
While some accuracy is lost, we ensure the ﬁnal result will
still be an upper bound by rounding the download time down.
xδ(n, t, m) = ⌊x(n, t, m)/δ⌋· δ
We cap the buffer level at bmax.
x′
δ(n, t, b, m) = max[xδ(n, t, m), b + p −bmax]
Let y(n, t, b, m) be the rebuffering time.
y(n, t, b, m) = max[x′
δ(n, t, b, m) −b, 0]
We generate entries for r(n, ·, ·) from r(n −1, ·, ·) using
r(n, t, b) = max
m,t′,b′

r(n −1, t′, b′) + υm −γy(n, t′, b′, m)

such that t = t′ + x′
δ(n, t′, b′, m) and
b = b′ −x′
δ(n, t′, b′, m) + y(n, t′, b′, m) + p.
The dynamic programming algorithm is shown in Fig. 4.
C. Evaluating BOLA-BASIC
Fig. 5 shows the time-average utility of BOLA-BASIC when
the video length is 10, 30 and 120 minutes. We set γp = 5 and
varied V for different buffer sizes. We compared the utility
of BOLA-BASIC with the ofﬂine optimal bound described
in Section V-B. The ofﬂine optimal gave nearly the same
utility for the different video lengths. BOLA-BASIC only
obtains about 80% of the ofﬂine optimal bound. Also, the
utility of BOLA-BASIC decreases slightly when the buffer
size is increased because it must download more lower-bitrate



<!-- page 8 -->

8
 0
 0.5
 1
 1.5
 2
 2.5
 3
 0
 10
 20
 30
 40
 50
 60
 70
time-average utility
maximum buffer size (s)
10 minutes BOLA-BASIC
30 minutes BOLA-BASIC
120 minutes BOLA-BASIC
offline optimal bound
Fig. 5. Time-average utility for γp = 5 using proﬁle 1 for BOLA-BASIC.
1: for n in [1, N] do
2:
t ←min[playtime from begin, playtime to end]
3:
t′ ←max[t/2, 3p]
4:
QD
max ←min[Qmax, t′/p]
5:
V D ←(QD
max −1)/(υM + γp)
6:
m∗[n] ←arg max
m
(V Dυm + V Dγp −Q)/Sm
7:
if m∗[n] > m∗[n −1] then
8:
r ←bandwidth measured when downloading segment (n −1)
9:
m′ ←max m such that Sm/p ≤max[r, S1/p]
10:
if m′ ≥m∗[n] then
11:
m′ ←m∗[n]
12:
else if m′ < m∗[n −1] then
13:
m′ ←m∗[n −1]
14:
else if some utility sacriﬁced for fewer oscillations then
15:
pause until (V Dυm′ + V Dγp −Q)/Sm′ ≥
(V Dυm′+1 + V Dγp −Q)/Sm′+1
▷BOLA-O
16:
else
17:
m′ ←m′ + 1
▷BOLA-U
18:
end if
19:
m∗[n] ←m′
20:
end if
21:
pause for max[p · (Q −QD
max + 1), 0]
22:
download segment n at bitrate index m∗[n], possibly abandoning
23: end for
Fig. 6. The BOLA Algorithm.
segments during startup before it can reach the buffer levels
required to switch to higher-bitrate segments. Our results
suggests that there is room to improve BOLA-BASIC that
motivates our next version.
D. Adapting BOLA to Finite-Sized Videos
BOLA-BASIC was derived under the assumption that the
videos are inﬁnite. Thus, some adaptations are needed for
BOLA to work effectively with smaller videos. Motivated by
our initial experiments, we implemented two adaptations to
BOLA-BASIC to derive a version we call BOLA-FINITE.
1) Dynamic V value for startup and wind down: A large
buffer allows BOLA-BASIC to perform better but it has two
drawbacks. First, it takes longer to prime a large buffer during
startup. Lower bitrate segments are preferred until the buffer
level reaches steady state. Second, at some late stage all
downloads are complete and any remaining buffered video is
played out. Any available bandwidth during this period is not
utilized. Shortening this period would result in less unutilized
available bandwidth. We mitigate these effects by introducing
a dynamic V D which corresponds to a dynamic buffer size
1: function SHALLABANDON(m, SR
m)
2:
rm ←(V Dυm + V Dγp −Q)/SR
m
3:
rm′ ←(V Dυm′ + V Dγp −Q)/Sm′
4:
return true if rm′ > rm for some m′ subject to 1 ≤m′ < m
5: end function
Fig. 7. BOLA-FINITE’s Download Abandonment Heuristic: m is the current
segment bitrate and SR
m is the number of bits remaining to download in the
current segment.
 0
 0.5
 1
 1.5
 2
 2.5
 3
 0
 20
 40
 60
 80
 100
time-average utility
maximum buffer size (s)
10 minutes BOLA-FINITE
30 minutes BOLA-FINITE
120 minutes BOLA-FINITE
30 minutes BOLA-U
offline optimal bound
Fig. 8. Time-average utility for γp = 5 using proﬁle 1 for BOLA-FINITE
and BOLA-U.
QD
max, shown in lines 2–5 in Fig. 6. BOLA-FINITE does not
try to ﬁll the whole buffer too soon and does not try to maintain
a full buffer too long. We still need a minimum buffer size 3p
for the algorithm to work effectively.
2) Download abandonment: BOLA-BASIC takes control
decisions just before the download of each segment. Con-
sider a scenario where the player is downloading high-bitrate
6 Mbps segments in good network conditions. The network
bandwidth suddenly drops to 1 Mbps as the player has just
started a new segment download. The segment will take
6p seconds to download, depleting the buffer and possibly
causing rebuffering. BOLA-FINITE mitigates this problem
by monitoring download progress and possibly abandoning a
download. Fig. 7 shows how BOLA-FINITE decides whether
or not to abandon the download. If a segment at bitrate
index m is being downloaded, the remaining size SR
m is less
than Sm. The segment can be abandoned and downloaded
at some bitrate index m′ subject to 1 ≤m′ < m when
(V Dυm + V Dγp −Q)/SR
m < (V Dυm′ + V Dγp −Q)/Sm′.
The control idea remains the same, but the current bitrate
m has a smaller corresponding size SR
m because part of the
segment has already been downloaded. Fig. 3 illustrates a
scenario where abandonment might help. At 46s a 3 Mbps
segment download starts. Since there is a bandwidth drop at
the time, the segment takes almost 9s to download. The buffer
is depleted and BOLA-BASIC switches to downloading at a
bitrate of 0.3 Mbps. BOLA-FINITE with abandonment logic
would have detected the rapidly depleting buffer and stopped
the long download, with the system only dropping to the 1.4
and 0.7 Mbps download bitrates in the low-bandwidth period.
Fig. 8 shows the time-average utility of BOLA-FINITE
for 10, 30 and 120 minutes of playback time with γp = 5.
Comparing with BOLA-BASIC in Fig. 5, we see that the time-
average utility is much closer to the ofﬂine optimal bound. The



<!-- page 9 -->

9
  0
0.5
  1
1.5
  2
2.5
  3
1
2
3
4
5
6
7
8
9
10
11
12
3G
time-average utility
network profle index
Optimal Bound
BOLA-O
BOLA-U
Fig. 9. The time-average utility of BOLA-O and BOLA-U with γp = 5 and a 25-second buffer playing a 30-minute video for the DASH test network proﬁles
1–12 and mobile traces (3G). BOLA utility is within 84–95% of ofﬂine optimal utility.
  0
0.2
0.4
0.6
0.8
  1
1
2
3
4
5
6
7
8
9
10
11
12
3G
average bitrate change (Mbps)
network profle index
BOLA-O
BOLA-U
ELASTIC
PANDA
MPC
Pensieve
Fig. 10. The average bitrate change between adjacent segments was smaller for BOLA-O than for BOLA-U, but some bitrate change is needed to accurately
track the network bandwidth. In our experiments, as an average across network proﬁles, ELASTIC and PANDA tracked the bandwidth with similar accuracy
to BOLA-O, while MPC and Pensieve had more oscillations.
beneﬁt of the adjustments is also evident as the buffer grows
larger, as there is no signiﬁcant decrease in utility caused by
ﬁlling the buffer with low-bitrate segments in the earlier stages
of the video.
E. Avoiding Bitrate Oscillations
While our performance objective optimizes playback utility
and playback smoothness, users are also sensitive to excessive
bitrate switching. We discuss three causes of bitrate switches.
1) Bandwidth variation: As the network conditions change,
the player varies the bitrate, tracking the network bandwidth.
Such switches are acceptable; the player has no control on the
bandwidth and should adapt to different network conditions.
2) Dense buffer thresholds: Either a larger number of bitrate
levels and/or a smaller buffer size may push the threshold
levels closer. If the differences between threshold levels are
less than the segment duration p, adding one downloaded
segment to the buffer may push the buffer level over several
threshold levels at once. This might cause BOLA-FINITE to
overshoot and choose a bitrate that is too high for the avail-
able bandwidth. Consequently, the segment download would
take much more than p seconds, leading to excessive buffer
depletion, causing BOLA-FINITE to switch down its bitrate
by more than one level. In such a scenario BOLA-FINITE can
oscillate between bitrates, even when the available bandwidth
is stable.
3) Bitrate quantization: Having a stable network bandwidth
and widely-spaced thresholds still does not avoid all bitrate
switching. Suppose the bandwidth is 2.0 Mbps and it lies
between two encoded bitrates of 1.5 and 3.0 Mbps. While
the player downloads 1.5 Mbps segments, the buffer keeps
growing. When the buffer crosses the threshold the player
switches to 3.0 Mbps, depleting the buffer. After the buffer gets
sufﬁciently depleted, the player switches back to 1.5 Mbps,
and the cycle repeats. In this example, a viewer might prefer
the video player to stick to the 1.5 Mbps bitrate, sacriﬁcing
some utility in order to have fewer oscillations. Or, a viewer
might want to maximize utility and play a part of the video in
the higher bitrate of 3.0 Mbps at the cost of more oscillations.
We describe two variants of BOLA below to suit either viewer.
The ﬁrst variant that we call BOLA-O mitigates oscillations
by introducing bitrate capping (lines 7–20 in Fig. 6) when
switching to a higher bitrate. BOLA-O veriﬁes that the higher
bitrate is sustainable by comparing it to the bandwidth as
measured when downloading the previous segment (lines 8–
11). Since the motive is to limit oscillations rather than to
predict future bandwidth, this adaptation does not drop the
bitrate to a lower level than in the previous download (lines
12–13). Continuous downloading at a bitrate lower than the



<!-- page 10 -->

10
  0
0.5
  1
1.5
  2
2.5
  3
1
2
3
4
5
6
7
8
9
10
11
12
3G
time-average utility
network profle index
BOLA-O
BOLA-U
ELASTIC
PANDA
MPC
Pensieve
Fig. 11. The time-average utility of BOLA-O, BOLA-U, ELASTIC, PANDA, MPC and Pensieve with γp = 5 playing a 30-minute video for the DASH
test network proﬁles 1–12 and mobile traces (3G). Compared with ELASTIC and PANDA, BOLA-U has about 1.75 times the utility of the other algorithms
in roughly half the cases. MPC has a utility between BOLA-O and BOLA-U. Pensieve has a utility between BOLA-O and BOLA-U for proﬁles 1–12 but
performs worse for the mobile (3G) traces.
  0
  1
  2
  3
  4
  5
1
2
3
4
5
6
7
8
9
10
11
12
3G
(a)  average bitrate (Mbps)
network profle index
BOLA-O
BOLA-U
ELASTIC
PANDA
MPC
Pensieve
  0
0.05
0.1
0.15
0.2
0.25
1
2
3
4
5
6
7
8
9
10
11
12
3G
(b)  average rebuffer/play ratio
network profle index
BOLA-O
BOLA-U
ELASTIC
PANDA
MPC
Pensieve
Fig. 12. Comparing BOLA with ELASTIC, PANDA, MPC and Pensieve using raw metrics: average bitrate and rebuffer-to-play ratio. BOLA, PANDA and
Pensieve do not rebuffer for proﬁles 1–12. ELASTIC has almost no rebuffering for proﬁles 1–6, but it has a rebuffer-to-play ratio greater than 20% for proﬁles
7–12. MPC has some rebuffering for almost all proﬁles. Pensieve has no rebuffering for proﬁles 1–12. But, Penseive has a 24% rebuffer-to-play ratio for the
mobile (3G) traces, as it is unable to perform well for bandwidth conditions that are signiﬁcantly different from its training set.
bandwidth would cause the buffer to keep growing. BOLA-O
avoids this by allowing the buffer to slip to the appropriate
threshold before starting the download (line 15).
The second variant that we call BOLA-U does not sacriﬁce
utility. Excessive buffer growth is avoided by allowing the
bitrate to be one level higher than the sustainable bandwidth
(line 17). This allows the player to choose 3 Mbps in the
example. While BOLA-U does not handle the third type of
oscillations, it handles the more severe second type.
Looking back at Fig. 8, we see that the added stability of
BOLA-U pays off when using a small buffer size and BOLA-U
achieves a larger utility than BOLA-FINITE. Fig. 9 shows the
time-average utility of BOLA-O and BOLA-U with γp = 5
and Qmaxp = 25s playing a 30-minute video. The utility lost
by BOLA-O to avoid oscillations is clearly evident. In practice
the lost utility is limited by the distance between encoded
bitrates; if the next lower bitrate level is not far from the
network bandwidth, then little utility will be lost.
We measure oscillations by comparing consecutive seg-
ments. The change in bitrate between a segment and the next is
the absolute difference between bitrates (in Mbps) of the two
segments. Fig. 10 shows the bitrate change averaged across



<!-- page 11 -->

11
all the segments. While BOLA-U has a high average bitrate
change because of the quantization, BOLA-O only switches
bitrate because of network bandwidth variations.
F. Comparison With State-of-the-Art Algorithms
We now compare BOLA with four state-of-the art algo-
rithms, ELASTIC [12], PANDA [13], MPC [14] and Pen-
sieve [15]. We use the default design parameters in [12]–
[15]. We test both BOLA-O and BOLA-U. Although BOLA
performs better with larger buffers, we limited the buffer size
to 25s for the tests to ensure fairness. ELASTIC targets a
buffer level of 15s but the buffer level varies higher. PANDA
targets a minimum buffer level of 26s. We use the RobustMPC
variant of MPC with a buffer size of 25s. MPC relies on
bandwidth estimation; we use the harmonic mean over the last
ﬁve segment downloads to be consistent with the empirical
evaluation method in [14]. We trained a Pensieve neural
network model for the video with a buffer size of 25s. For
training Pensieve, we used bandwidth traces generated using
the tool provided in the Pensieve repository as recommended.
Fig. 11 compares the algorithms using each of the 12
network proﬁles and the mobile traces. BOLA-U consistently
performs signiﬁcantly better than PANDA. While BOLA-U
and ELASTIC perform similarly for proﬁles 1–6, BOLA-U
performs signiﬁcantly better for the other proﬁles that have
larger bandwidth variations. MPC and Pensieve consistently
obtains a utility between BOLA-O and BOLA-U for proﬁles
1–12, but perform worse for the mobile traces. We repeat the
comparison using the average bitrate and rebuffering metrics in
Fig. 12. This gives an insight into the strengths and weaknesses
of the different algorithms.
Comparing BOLA-U with ELASTIC: For proﬁles 1–6,
BOLA-U has approximately the same bitrate as ELASTIC.
ELASTIC has a higher bitrate for proﬁles 7–12, but that comes
at a signiﬁcant cost in terms of rebuffering. For these proﬁles,
the ratio of the rebuffering time to the play time is more
than 20% for ELASTIC, while BOLA-U has no rebuffering.
For the mobile traces, ELASTIC has marginally higher bitrate
than BOLA-U but has a 12.0% rebuffer-to-play ratio compared
with BOLA-U’s 3.5%. ELASTIC rebuffers signiﬁcantly more
because it does not react in time when the bandwidth drops.
Comparing BOLA-U with PANDA: Both algorithms do
not rebuffer for proﬁles 1–12. For the mobile traces, BOLA-U
and PANDA have a rebuffer-to-play ratio of 3.5% and 2.6%
respectively. However, PANDA has signiﬁcantly lower bitrate
than BOLA-U. The reason is that PANDA is more conservative
and in some cases does not change to a higher bitrate even if
it is sustainable.
Comparing BOLA-U with MPC: Both algorithms have
similar average bitrates but MPC has slightly higher bitrate
for some of the proﬁles. However, while BOLA-U does not
rebuffer, MPC has some rebuffering for most of the proﬁles.
While it is possible to tune the MPC parameters to avoid
that rebuffering, it is not clear how to choose parameters that
consistently work for different network conditions. Another
factor that might contribute to MPC rebuffering is the band-
width estimation. When there is a large drop in bandwidth,
the recommended harmonic mean bandwidth estimator takes
a while to react. Even though RobustMPC factors in network
estimation error, rebuffering is not totally eliminated.
Comparing BOLA-U with Pensieve: For proﬁles 1–12,
Pensieve obtains utility between BOLA-O and BOLA-U, but
consistently closer to BOLA-U. However, Pensieve has too
much rebuffering in the mobile traces, resulting in much worse
utility for these traces. While the network traces used to train
Pensieve included periods with low bandwidth similar to the
mobile traces, Pensieve did not learn a model that would
perform well in relatively low bandwidth situations in a mobile
setting. This points to a weakness in Pensieve as it is unable to
adapt to bandwidth conditions that are signiﬁcantly different
from the training set.
In Fig. 10 we show our results for our secondary metric
of bitrate oscillations. BOLA-U does not perform well in this
metric, since it attempts to maximize utility at the cost of
increased oscillations. Comparing BOLA-O with ELASTIC,
PANDA, MPC, and Pensieve, ELASTIC has a lower average
change than BOLA-O only in the cases where it has a
slow reaction and excessive rebuffering. PANDA has a lower
average change because it is more conservative and in some
cases does not change to a higher bitrate even if that bitrate is
sustainable. MPC has higher average change than BOLA-O for
proﬁles 1–12. Pensieve has similar average change to BOLA-O
for proﬁles 1–12.
We also tested the algorithms with more videos to in-
vestigate performance when changing characteristics such as
content type, segment duration, and available bitrates. The tests
showed similar results. One example is the video provided
with Pensieve. The video has 49 segments with a segment
duration of 4s. It is encoded at six bitrates: 0.3, 0.75, 1.2, 1.85,
2.85 and 4.3 Mbps. Fig. 13 shows the utility and metrics for
the same six algorithms with similar conclusions to Figs. 10–
12. Note that Pensieve fails to perform well on mobile traces
again, since it is signiﬁcantly different from its training set.
Thus, from our empirical analysis, we can conclude that
BOLA achieves higher utility, and performs more consis-
tently across different scenarios in comparison with ELASTIC,
PANDA, MPC and Pensieve. One reason for the consistency of
BOLA is that it does not have a large number of parameters.
BOLA has two design parameters γ and V , which have an
intuitive signiﬁcance as discussed in Section IV-B, and an
option of whether or not to trade off some utility to reduce
oscillations. Other algorithms have a number of different
parameters and tuning the parameters for a particular scenario
might make the system less suited for other scenarios. Also,
BOLA’s ability to abandon a segment during a download and
start the download at a lower bitrate allows BOLA to achieve
signiﬁcantly less rebuffering than the other algorithms.
Note: A number of recent papers compare new algorithms
with BOLA. Some of the prior work used the experimental
version of BOLA in dash.js versions 2.0.0–2.5.0 that required
bug ﬁxes. We suggest that a stable version used in production
(dash.js version 2.6.0 or later) be used for such comparisons
for a more accurate evaluation of BOLA. Also, dash.js has a
default buffer size of 12s, leading some researchers to compare
a large-buffer algorithm with a small-buffer BOLA. Our work



<!-- page 12 -->

12
 -1
-0.5
  0
0.5
  1
1.5
  2
2.5
1
2
3
4
5
6
7
8
9
10
11
12
3G
(a) time-average utility
network profle index
BOLA-O
BOLA-U
ELASTIC
PANDA
MPC
Pensieve
  0
  1
  2
  3
  4
  5
1
7
3G
(b)  average bitrate (Mbps)
network profle index
  0
0.1
0.2
0.3
0.4
1
7
3G
(c)  average rebuffer/play ratio
network profle index
  0
0.2
0.4
0.6
0.8
1
7
3G
(d)  average bitrate change (Mbps)    
network profle index
Fig. 13. The time-average utility of BOLA-O, BOLA-U, ELASTIC, PANDA, MPC and Pensieve with γp = 5 playing a different video for 30 minutes, using
the DASH test network proﬁles 1–12 and the mobile traces (3G). Note that Pensieve has negative 3G utility because of excessive rebuffering (the average
rebuffer-to-play ratio is 38%). The raw metrics are also provided in the plots above.
uses the correct BOLA implementation and the same buffer
size for all the compared algorithms.
VI. DEPLOYMENT
A. The DASH Reference Player
After developing a theoretical foundation for BOLA and
testing it by simulation, we deployed BOLA in a production
setting. Particularly, we implemented BOLA in dash.js, the
open-source standard DASH reference player [18]. Through
dash.js, BOLA is now being used in production by several
major video providers and delivery networks such as Akamai,
BBC, CBS and Orange. Deployment in production presented a
number of new challenges such as operating with even smaller
buffer capacities, correctly handling events such as a user seek
to a different point in the video, and tolerating delays caused
by the video player unrelated to the network conditions. The
techniques we implemented to handle these new challenges
are described in [19].
B. BOLA Parameters
One deployment challenge involves choosing the BOLA pa-
rameters γ and V . We gave an intuition to pick the parameters
in Section IV-B, but video providers are more familiar with
choosing buffer level targets. For this purpose, we now discuss
how to derive γ and V from intuitive requirements. Consider
the following requirements:
1. We want a maximum buffer level Qmax.
2. We want to download at the highest bitrate when the buffer
level is Qmax.
3. We want to download at the lowest bitrate when the buffer
level is less than a threshold Qlow, and we want to download at
a higher bitrate when the buffer level goes above the threshold.
These requirements are easy to understand for video providers
who might not be familiar with BOLA. In fact, video providers
usually have some preferred maximum buffer level Qmax.
Further, they might have preference for Qlow such as 10s as
described in [19].
To satisfy requirements 1–2, we want (11) to switch from
choosing aM = 1 to choosing P am = 0 at the threshold
when the buffer level is Qmax. This happens if
ρaM=1 = ρa=0
V (υM + γp) −Qmax
SM
= 0
(13)
Note that BOLA satisﬁes requirement 2 and downloads at the
highest bitrate just before the Qmax threshold because at that
buffer level we get ρam=1 < ρaM=1 for m < M. This is
illustrated in Fig. 1.
To satisfy requirement 3, we want (11) to switch from
choosing a1 = 1 to choosing a2 = 1 at the threshold when
the buffer level is Qlow. This happens if
ρa1=1 = ρa2=1
V (υ1 + γp) −Qlow
S1
= V (υ2 + γp) −Qlow
S2
(14)



<!-- page 13 -->

13
Solving (13)–(14), we obtain
V = Qmax −Qlow
υM −α
,
γp = υMQlow −αQmax
Qmax −Qlow
where
α = S1υ2 −S2υ1
S2 −S1
.
When calculating the BOLA parameters from Qlow and
Qmax, the previous intuition about γ and V still hold. If
a video provider chooses a larger Qlow, γ will be larger
and BOLA will give more weight to rebuffering. If a video
provider chooses a larger Qmax, V will be larger.
VII. RELATED WORK
There has been a lot of recent work on bitrate adapta-
tion algorithms, much of which is based on estimating the
bandwidth of the network connection. FESTIVE [10] uses
a harmonic bandwidth estimator to predict future bandwidth
from past downloads, limiting bitrate change to one level
between successive segments for stability. Notably, FESTIVE
attempts to ﬁnd a tradeoff between efﬁciency and fairness with
competing downloads. BBA [11] is a buffer-based algorithm.
BOLA has a few similarities to BBA but the mapping function
from buffer level to video bitrate is different. Also, BBA
assumes that the buffer size is large (in the order of minutes),
thereby making it not suitable for short videos. Further, it
does not provide any theoretical guarantees for its buffer-based
approach. A notable algorithm is ELASTIC [12] that uses
control theory to adjust the bitrate so as to keep the buffer
occupancy at a constant level. Another notable algorithm is
PANDA [13] which also estimates the network bandwidth.
PANDA drops the download bitrate as soon as low bandwidth
is detected but only increases the bitrate slowly to probe
the real capacity when a higher bandwidth is detected. Like
FESTIVE, PANDA trades efﬁciency for fairness. In [14], an
algorithm using model predictive control (MPC) is proposed
to optimize a comprehensive set of metrics. In this approach,
the bitrate for the current segment is chosen based on a
network bandwidth prediction for the next few segments. But,
its performance depends on the accuracy of such a prediction.
The approach also requires signiﬁcant ofﬂine optimization
to be performed outside of the client for an exhaustive set
of scenarios. [15] presents Pensieve, a reinforcement-learning
approach to ABR. A neural network model can be trained for
a video using a particular buffer size, using a QoE function
for reward. A set of bandwidth traces is used as training data.
Unfortunately, a trained model does not transfer easily to a
different video or, more importantly, to bandwidth conditions
not represented in the training data. Unlike prior work, we
derive a buffer-based algorithm with theoretical guarantees that
is simple to implement within the client and we empirically
show its efﬁcacy on extensive network traces. In recent work
[23], a method called Oboe for auto-tuning the parameters
of BOLA and MPC was presented and shown to improve
both algorithms. Further, the work showed that Oboe used in
conjunction with traditional ABR algorithms performs better
than reinforcement-learning based ABR such as Pensieve.
VIII. CONCLUSION
We formulated video bitrate adaptation for ABR streaming
as a utility maximization problem and derived BOLA, an
online control algorithm that is provably near-optimal. Further,
we empirically demonstrated the efﬁcacy of BOLA using
extensive traces. In particular, we showed that our online al-
gorithm achieves utility close to the optimal ofﬂine algorithm.
We showed that our algorithm performs better than state-of-
the-art algorithms in a number of different test scenarios. We
also implemented BOLA in dash.js, the open-source standard
DASH reference player [18]. Through dash.js, BOLA is now
being used in production by several major video providers and
delivery networks such as Akamai, BBC, CBS and Orange.
IX. ACKNOWLEDGMENTS
We would like to thank Daniel Sparacio and Will Law of
Akamai for their key insights on real-world player imple-
mentations. Further, Daniel was instrumental in helping us
implement BOLA in the DASH reference player.
APPENDIX
PROOF OF THEOREM 1
We ﬁrst show part 1 using induction. Note that the bound
Q(tk) ≤V (υM + γp) + 1 holds for k = 1 since Q(t1) =
Q(0) = 0. Now suppose it holds for some k. We will show
that it will also hold for k + 1. We have two cases.
Case 1: Q(tk) ≤V (υM + γp)
From the queueing equation (4), it follows that the maximum
that Q(tk) can increase in slot k is by 1. This implies that
Q(tk+1) ≤V (υM + γp) + 1.
Case 2: V (υM + γp) < Q(tk) ≤V (υM + γp) + 1
We have Q(tk) > V (υm + γp) for all m ∈{1, 2, . . . , M}
(using (1)). It follows from the structure of optimal solution
to (11) that BOLA will choose the no-download option in
this case. As a result, Q(tk) cannot increase and we have that
Q(tk+1) ≤V (υM + γp) + 1.
Q(tk) denotes the total number of segments in the buffer.
This can be at most Qmax using the relation
V ≤Qmax −1
υM + γp .
In part 2, we show the bound in (12) using the technique
of Lyapounov optimization over variable size frames [21]. We
ﬁrst deﬁne a Lyapunov function L(Q(tk)) as
L(Q(tk)) = 1
2Q2(tk)
and deﬁne the per-slot conditional Lyapunov drift D(tk) as
D(tk) △= E {L(Q(tk+1)) −L(Q(tk))|Q(tk)} .
We use the queueing equation (4), to bound D(tk). We
consider two cases for (4): Q(tk) ≤Tk/p and Q(tk) > Tk/p.
In the ﬁrst case we have
D(tk) = E
(
1
2
 M
X
m=1
am(tk)
!2
−1
2Q2(tk)|Q(tk)
)
.



<!-- page 14 -->

14
In the second case we have
D(tk) = E
(
1
2
 
Tk
p −
M
X
m=1
am(tk)
!2
−Q(tk)
 
Tk
p −
M
X
m=1
am(tk)
!
|Q(tk)
)
In both cases, D(tk) is bounded by
D(tk) ≤p2 + Ψ
2p2
−Q(tk)E
(
Tk
p −
M
X
m=1
am(tk)|Q(tk)
)
(15)
where Ψ is an upper bound on E

T 2
k
	
under any control
algorithm and is assumed to be ﬁnite.
Following the methodology of the Lyapunov optimization
technique, we subtract V ×reward term from both sides of the
above to get
D(tk) −V E
( M
X
m=1
am(tk)(υm + γp)|Q(tk)
)
≤p2 + Ψ
2p2
−Q(tk)E
(
Tk
p −
M
X
m=1
am(tk)|Q(tk)
)
−V E
( M
X
m=1
am(tk)(υm + γp)|Q(tk)
)
(16)
Let us denote the control decisions (and resulting slot lengths)
under our control algorithm by the superscript BOLA while
those under the stationary policy of Lemma 1 by STAT. Since
BOLA greedily maximizes over a frame, it ensures that
E
( M
X
m=1
aBOLA
m
(tk)(Q(tk) −V (υm + γp))|Q(tk)
)
≤η × E
( M
X
m=1
aSTAT
m
(tk)(Q(tk) −V (υm + γp))|Q(tk)
)
(17)
where η =
E{T BOLA
k
|Q(tk)}
E{T STAT
k
|Q(tk)} . To see this, compare the ratio on
the left hand side above with the objective in (11) while noting
that we can express the denominator as E

T BOLA
k
|Q(tk)
	
=
(PM
m=1 aBOLA
m
(tk)Sm)/ωavg. It should be noted that this ratio
can be minimized without requiring knowledge of ωavg. Then
we use (17) to express (16) as
DBOLA(tk) −V E
( M
X
m=1
aBOLA
m
(tk)(υm + γp)|Q(tk)
)
≤p2 + Ψ
2p2
−Q(tk)E
(
T BOLA
k
p
−η
M
X
m=1
aSTAT
m
(tk)|Q(tk)
)
−V ηE
( M
X
m=1
aSTAT
m
(tk)(υm + γp)|Q(tk)
)
Substituting the time-average values for the stationary policy
we get
DBOLA(tk) −V E
( M
X
m=1
aBOLA
m
(tk)(υm + γp)|Q(tk)
)
≤p2 + Ψ
2p2
−Q(tk)
1
p −rSTAT
E

T BOLA
k
|Q(tk)
	
−V (υ∗+ γs∗)E

T BOLA
k
|Q(tk)
	
(18)
where rSTAT denotes the expected arrival rate under the
stationary policy and cannot exceed 1/p since it is rate stable.
Thus we have
DBOLA(tk) −V E
( M
X
m=1
aBOLA
m
(tk)(υm + γp)|Q(tk)
)
≤p2 + Ψ
2p2
−V (υ∗+ γs∗)E

T BOLA
k
|Q(tk)
	
(19)
Taking conditional expectation of both sides and summing
over k ∈{1, 2, . . . , KN}, we get
E

L(Q(tKN+1))
	
−V E
(KN
X
k=1
M
X
m=1
aBOLA
m
(tk)(υm + γp)
)
≤(p2 + Ψ)KN
2p2
−V (υ∗+ γs∗)E
(KN
X
k=1
T BOLA
k
)
(20)
Dividing both sides by V E
nPKN
k=1 T BOLA
k
o
and taking the
limit as N →∞yields the bound in (12).
REFERENCES
[1] K. Spiteri, R. Urgaonkar, and R. K. Sitaraman, “BOLA: near-optimal
bitrate adaptation for online videos,” IEEE/ACM Transactions on Net-
working, 2020, doi:10.1109/TNET.2020.2996964.
[2] Cisco, “Cisco visual networking index: Forecast and trends, 2017–2022
white paper,” 2019, https://www.cisco.com/c/en/us/solutions/collateral/
service-provider/visual-networking-index-vni/white-paper-c11-741490.
html.
[3] F. Dobrian, V. Sekar, A. Awan, I. Stoica, D. Joseph, A. Ganjam, J. Zhan,
and H. Zhang, “Understanding the impact of video quality on user
engagement,” in Proc. ACM SIGCOMM, 2011.
[4] S. S. Krishnan and R. K. Sitaraman, “Video stream quality impacts
viewer behavior: inferring causality using quasi-experimental designs,”
in Proc. ACM IMC, 2012.
[5] R. K. Sitaraman, “Network performance: Does it really matter to users
and by how much?” in Proc. COMSNETS, 2013.
[6] “Apple HTTP Live Streaming,” https://developer.apple.com/resources/
http-streaming/, accessed: September, 25, 2014.
[7] “Microsoft Smooth Streaming,” http://www.iis.net/downloads/microsoft/
smooth-streaming, accessed: September, 25, 2014.
[8] “Adobe HTTP Dynamic Streaming,” http://www.adobe.com/products/
hds-dynamic-streaming.html, accessed: September, 25, 2014.
[9] T. Stockhammer, “Dynamic Adaptive Streaming over HTTP – Standards
and Design Principles,” in Proc. ACM MMSys, 2011.
[10] J. Jiang, V. Sekar, and H. Zhang, “Improving fairness, efﬁciency, and
stability in http-based adaptive video streaming with festive,” IEEE/ACM
Transactions on Networking (ToN), vol. 22, no. 1, pp. 326–340, 2014.
[11] T.-Y. Huang, R. Johari, N. McKeown, M. Trunnell, and M. Watson,
“A Buffer-based Approach to Rate Adaptation: Evidence from a Large
Video Streaming Service,” in Proc. ACM SIGCOMM, 2014.
[12] L. De Cicco, V. Caldaralo, V. Palmisano, and S. Mascolo, “ELASTIC:
a client-side controller for dynamic adaptive streaming over HTTP
(DASH),” in Packet Video Workshop (PV), 2013.
[13] Z. Li, X. Zhu, J. Gahm, R. Pan, H. Hu, A. Begen, and D. Oran, “Probe
and adapt: Rate adaptation for HTTP video streaming at scale,” IEEE
JSAC, vol. 32, no. 4, pp. 719–733, 2014.
[14] X. Yin, A. Jindal, V. Sekar, and B. Sinopoli, “A control-theoretic
approach for dynamic adaptive video streaming over HTTP,” in Proc.
ACM SIGCOMM, 2015.



<!-- page 15 -->

15
[15] H. Mao, R. Netravali, and M. Alizadeh, “Neural adaptive video stream-
ing with pensieve,” in Proc. ACM SIGCOMM, 2017.
[16] “Guidelines for Implementation: DASH-AVC/264 Test cases and Vec-
tors,” http://dashif.org/guidelines/, DASH Industry Forum, January 2014.
[17] H. Riiser, P. Vigmostad, C. Griwodz, and P. Halvorsen, “Commute path
bandwidth traces from 3G networks: analysis and applications,” in Proc.
ACM MMsys, 2013.
[18] “DASH reference client,” https://reference.dashif.org/dash.js/, accessed:
June, 28, 2019.
[19] K. Spiteri, R. Sitaraman, and D. Sparacio, “From theory to practice:
Improving bitrate adaptation in the DASH reference player,” ACM Trans.
Multimedia Comput. Commun. Appl., vol. 15, no. 2s, pp. 67:1–67:29,
2019.
[20] D. Bertsekas, Dynamic programming and optimal control.
Athena
Scientiﬁc Belmont, MA, 1995, vol. 1.
[21] M. J. Neely, “Stochastic network optimization with application to
communication and queueing systems,” Synthesis Lectures on Commu-
nication Networks, vol. 3, no. 1, pp. 1–211, 2010.
[22] M. J. Neely, “Dynamic optimization and learning for renewal systems,”
IEEE Transactions on Automatic Control, vol. 58, no. 1, pp. 32–46,
2012.
[23] Z. Akhtar, Y. S. Nam, R. Govindan, S. Rao, J. Chen, E. Katz-Bassett,
B. Ribeiro, J. Zhan, and H. Zhang, “Oboe: Auto-tuning video abr
algorithms to network conditions,” in Proc. ACM SIGCOMM, 2018.
[24] “Big Buck Bunny Movie,” https://peach.blender.org/, accessed: July 31,
2015.
[25] P. Romirer-Maierhofer, F. Ricciato, A. D’Alconzo, R. Franzan, and
W. Karner, “Network-wide measurements of TCP RTT in 3G,” in Trafﬁc
Monitoring and Analysis. Springer Berlin Heidelberg, 2009, pp. 17–25.


