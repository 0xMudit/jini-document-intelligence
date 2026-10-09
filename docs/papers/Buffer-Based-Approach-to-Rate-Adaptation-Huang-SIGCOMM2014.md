# Buffer-Based-Approach-to-Rate-Adaptation-Huang-SIGCOMM2014

- **Source file:** Buffer-Based-Approach-to-Rate-Adaptation-Huang-SIGCOMM2014.pdf
- **Pages:** 14
- **Creation date:** D:20140609232923+03'00'

---

<!-- page 1 -->

A Buffer-Based Approach to Rate Adaptation:
Evidence from a Large Video Streaming Service
Te-Yuan Huang, Ramesh Johari, Nick McKeown, Matthew Trunnell∗, Mark Watson∗
Stanford University, Netﬂix∗
{huangty,rjohari,nickm}@stanford.edu, {mtrunnell,watsonm}@netﬂix.com
ABSTRACT
Existing ABR algorithms face a signiﬁcant challenge in esti-
mating future capacity: capacity can vary widely over time,
a phenomenon commonly observed in commercial services.
In this work, we suggest an alternative approach: rather
than presuming that capacity estimation is required, it is
perhaps better to begin by using only the buﬀer, and then
ask when capacity estimation is needed. We test the viabil-
ity of this approach through a series of experiments spanning
millions of real users in a commercial service. We start with
a simple design which directly chooses the video rate based
on the current buﬀer occupancy. Our own investigation re-
veals that capacity estimation is unnecessary in steady state;
however using simple capacity estimation (based on immedi-
ate past throughput) is important during the startup phase,
when the buﬀer itself is growing from empty. This approach
allows us to reduce the rebuﬀer rate by 10–20% compared
to Netﬂix’s then-default ABR algorithm, while delivering a
similar average video rate, and a higher video rate in steady
state.
Categories and Subject Descriptors
C.2.0 [Computer Systems Organization]:
Computer-
Communication Networks—General
Keywords
HTTP-based Video Streaming, Video Rate Adaptation Al-
gorithm
1.
INTRODUCTION
During the evening peak hours (8pm–1am EDT), well over
50% of US Internet traﬃc is video streamed from Netﬂix and
YouTube [16, 17]. Unlike traditional video downloads that
must complete fully before playback can begin, streaming
video starts playing within seconds. Each video is encoded
at a number of diﬀerent rates (typically 235kb/s standard
deﬁnition to 5Mb/s high deﬁnition) and stored on servers
Permission to make digital or hard copies of all or part of this work for personal or
classroom use is granted without fee provided that copies are not made or distributed
for proﬁt or commercial advantage and that copies bear this notice and the full citation
on the ﬁrst page. Copyrights for components of this work owned by others than the
author(s) must be honored. Abstracting with credit is permitted. To copy otherwise, or
republish, to post on servers or to redistribute to lists, requires prior speciﬁc permission
and/or a fee. Request permissions from permissions@acm.org.
SIGCOMM’14, August 17–22, 2014, Chicago, Illinois, USA.
Copyright is held by the owner/author(s). Publication rights licensed to ACM.
ACM 978-1-4503-2836-4/14/08 ...$15.00.
http://dx.doi.org/10.1145/2619239.2626296.
0
500
1000
1500
2000
2500
Time (s)
0
2000
4000
6000
8000
10000
12000
14000
16000
18000
Average Throughput over a Chunk Download 
 (kb/s)
Figure 1: Video streaming clients experience highly
variable end-to-end throughput.
as separate ﬁles.
The video client—running on a home
TV, game console, web browser, DVD player, etc.—chooses
which video rate to stream by monitoring network condi-
tions and estimating the available network capacity. This
process is referred to as adaptive bit rate selection or ABR.
ABR algorithms used by such services balance two over-
arching goals. On one hand, they try to maximize the video
quality by picking the highest video rate the network can
support. On the other hand, they try to minimize rebuﬀer-
ing events which cause the video to halt if the client’s play-
back buﬀer goes empty.
It is easy for a streaming service to meet either one of the
objectives on its own. To maximize video quality, a service
could just stream at the maximum video rate Rmax all the
time. Of course, this would risk extensive rebuﬀering. On
the other hand, to minimize rebuﬀering, the service could
just stream at the minimum video rate Rmin all the time—
but this extreme would lead to low video quality. The design
goal of an ABR algorithm is to simultaneously obtain high
performance on both metrics in order to give users a good
viewing experience [7].
One approach is to pick a video rate by estimating fu-
ture capacity from past observations.
In an environment
with constant throughput, past observations are reliable to
predict future capacity. However, in an environment with
highly variable throughput, although past observations still
provide valuable ballpark ﬁgures, accurate estimation of fu-
ture capacity becomes challenging.
Figure 1 is a sample
trace reported by a Netﬂix video player, showing how the



<!-- page 2 -->

measured throughput varies wildly from 17Mb/s to 500kb/s.
Each point in the ﬁgure represents the average throughput
when downloading a video chunk. This variation has a sig-
niﬁcant impact on customers: approximately 10% of our
sessions experience at least this much variation, and 22% of
sessions experience at least half as much variation.1 Vari-
ation can be caused by many factors, such as WiFi inter-
ference, congestion in the network, congestion in the client
(e.g. anti-virus software scanning incoming http traﬃc), or
congestion at an overloaded video server.
In part due to highly variable throughput, current ABR
algorithms often augment their capacity estimation with an
“adjustment” based on the current level of the playback
buﬀer [5, 20]. Informally, the idea is that this adjustment
should make the rate selection more conservative when the
buﬀer is at risk of underrunning, and more aggressive when
the buﬀer is close to full. As we will see in Section 2, design-
ing an optimal adjustment in a highly variable throughput
environment is challenging; it is very hard to ﬁnd an ad-
justment function that prevents rebuﬀering without being
overly conservative. However, the notion of buﬀer-based ad-
justment used in current schemes is quite suggestive: note
that the occupancy of the playback buﬀer is the primary
state variable we are trying to manage. This inspires the
following question: namely, can we take the design to its
logical extreme, and choose the video rate based only on the
playback buﬀer occupancy?
In this paper, we consider using only the buﬀer to choose a
video rate, and then ask when capacity estimation is needed.
We observe two separate phases of operation: a steady-state
phase when the buﬀer has been built up, and a startup phase
when the buﬀer is still growing from empty. Our analysis
and experiments show that capacity estimation is not needed
during the steady state. We can rely only on the current
buﬀer occupancy to pick a video rate, allowing for a sim-
ple function to map current buﬀer occupancy to video rate.
On the other hand, as we will see in Section 6, during the
startup phase—just like the slow-start algorithm in TCP—
the buﬀer occupancy carries little or no information about
current network conditions. As a result, crude capacity es-
timation is helpful to quickly ramp up the video rate and
drive the algorithm into the steady state.
In this paper, we show—both formally and through a
deployment in the commercial Netﬂix service—that our al-
gorithms can avoid unnecessary rebuﬀering events and yet
achieve a high average video rate. We test this approach in
a Netﬂix browser-based video player, a popular commercial
streaming service, and present results from two A/B tests
with over half a million real users each, on three continents,
over two weekends during May-September 2013. Our exper-
iments allow us to evaluate the viability of the buﬀer-based
design.
We ﬁnd that this design approach can reduce the
rebuﬀer rate by 10–20% compared to Netﬂix’s then-default
ABR algorithm, while improving the steady-state video rate.
In Section 2, we ﬁrst dig into the implication of highly
variable throughput on ABR algorithm design. This discus-
sion motivates the buﬀer-based approach. In Section 3, we
introduce the broad class of buﬀer-based algorithms (BBA),
and identify the criteria to achieve our design goals in the
ideal setting. In Section 4, we design a very simple baseline
algorithm to test the viability of this approach in the steady-
1We deﬁne variation to be the ratio of 75th to 25th percentile
throughput; which is 5.6 for this trace.
state. The baseline algorithm reduces the rebuﬀer rate by a
promising 10–20% relative to a production algorithm. Nev-
ertheless, the rebuﬀer rate is still larger than our empirical
lower bound and delivers a lower average video rate than
the control algorithm.
We identify two reasons for the lower performance. First,
our baseline algorithm does not address variable bit-rate
(VBR) video encoding; we adapt our algorithm with a sim-
ple ﬁx to handle VBR in Section 5. Second, and more impor-
tantly, our baseline algorithm is optimized for steady-state.
During the startup phase (the ﬁrst few minutes of viewing),
the buﬀer is close to empty and contains less information
while in a transient phase. Although the performance of the
baseline buﬀer-based algorithm suggests capacity estimation
is not necessary in steady state, simple capacity estimation is
useful in the startup phase. In Section 6, we validate this hy-
pothesis by implementing techniques to improve video qual-
ity in the startup phase by estimating the immediate past
throughput. Together, our two improvements maintain the
reduction in rebuﬀer rate by approximately 10–20%, while
improving the video rate during steady state, and leaving
the average video rate essentially unchanged.
Finally, in
Section 7, we propose mechanisms to deal with temporary
network outages and to minimize rate switching.
2.
THE CHALLENGES OF A HIGHLY VARI-
ABLE ENVIRONMENT
In an environment with stable capacity, past observations
yield good estimates of future capacity. But if capacity is
varying widely, estimating future capacity is much harder.
Many techniques have been proposed to leverage the buﬀer
occupancy to work with inaccurate capacity estimates. In
this section, we ﬁrst look into the dynamics of the playback
buﬀer and understand how the buﬀer occupancy encodes
the relation between the selected video rate and the system
capacity.
We then consider how the buﬀer occupancy is
used to adjust inaccurate capacity estimates: essentially, the
algorithm becomes more“aggressive”when the buﬀer is close
to full, and more “conservative” when the buﬀer is close to
empty. While appealing, we ﬁnd that if capacity is highly
variable (as we ﬁnd it to be in practice), it is hard to prevent
rebuﬀering events with only an adjustment to the capacity
estimate.
However, the design of buﬀer-based adjustments is sug-
gestive, and motivates our design. In particular, our design
begins by using only the buﬀer occupancy to pick a video
rate, and then considers when capacity estimation is needed.
The pure buﬀer-based approach is suﬃcient when the buﬀer
contains enough information about the past capacity trace,
i.e., in steady state. On the other hand, simple capacity es-
timation proves valuable when the buﬀer contains little in-
formation, i.e., when the buﬀer is still growing from empty
a few minutes after the session starts.
2.1
Dynamics of the Playback Buffer
Figure 2 shows the dynamics of the playback buﬀer in the
client. The buﬀer occupancy is generally tracked in seconds
of video. Every second, one second of video is removed from
the buﬀer and played to the user. The buﬀer drains at unit
rate (since one second is played back every second of real
time). The client requests chunks of video from the server,
each chunk containing a ﬁxed duration of video (four seconds



<!-- page 3 -->

B(t)&
Input&
Rate&
Buﬀer&&
Size&
(seconds)&
Output&
Rate&
Buﬀer&
Occupancy&
(seconds)&
C(t)
R(t)
1&
Figure 2: The relationship between system capacity,
C(t), and video rate, R(t), in a video playback buﬀer.
Ini$al'
video''
rate'
'
Capacity'
es$ma$on'
Download'
&'measure'
Pick'a'rate'
Buﬀer'
Occupancy'
Adjustment'
func$on'
Video'rate'for'the'next'video'segment.'
R(t) 
ˆ 
C (t)
Figure 3:
Current practice adjusts the estimation
based on the buﬀer occupancy.
per chunk in our service). The higher the video rate, the
larger the chunk (in bytes).
If the ABR algorithm overestimates the capacity and picks
a video rate, R(t), that is greater than the system capacity,
C(t), then new data is put into the buﬀer at rate C(t)/R(t) <
1 and so the buﬀer decreases.
Put another way, if more
than one chunk is played before the next chunk arrives, then
the buﬀer is depleted. If the ABR algorithm keeps request-
ing chunks that are too big for the network to sustain (i.e.,
the video rate is too high), eventually the buﬀer will run
dry, playback freezes and we see the familiar “Rebuﬀering...”
message on the screen.
2.2
Working with Inaccurate Estimates
Many techniques have been proposed to work with in-
accurate estimates, by incorporating information about the
playback buﬀer. Some leverage control theory to adjust the
capacity estimation based on the buﬀer occupancy [5, 20],
some smooth the quality degradation according to the buﬀer
occupancy [15], and some randomize chunk scheduling de-
pending on the buﬀer occupancy to have better samples of
the channel [10].
At a high level, we can capture existing approaches using
the abstract design ﬂow in Figure 3. The client measures
how fast chunks arrive to estimate capacity, ˆC(t). The es-
timate is optionally supplemented with knowledge of the
buﬀer occupancy, which we represent by an adjustment fac-
tor F(B(t)), a function of the playback buﬀer occupancy.
The selected video rate is R(t) = F(B(t)) ˆC(t); diﬀerent de-
signs use diﬀerent adjustment functions F(·).
When the buﬀer contains many chunks, R(t) can safely
deviate from C(t) without triggering a rebuﬀer. The client
can“aggressively”try to maximize the video quality by pick-
ing R(t) = ˆC(t).
But when the buﬀer is low, the client should be more
“conservative”, deliberately underestimating capacity so as
to pick a lower video rate and quickly replenish the buﬀer. In
this case, designing the adjustment function is much harder,
as the following analysis shows.
Consider the case when
there is only one chunk in the buﬀer. The requested chunk
(V seconds) must arrive before the current chunk plays,
else the buﬀer will run dry.
In other words, we require
V R(t)/C(t) < B(t), where V R(t) is the chunk size in bytes.
Thus, the selected video rate R(t) needs to satisfy:
R(t) <
B(t)
V

C(t)
to prevent rebuﬀers. Replacing the selected video rate R(t)
with F(B(t)) ˆC(t) in the above inequality, we get the follow-
ing requirement on F(B(t)) to avoid rebuﬀers:
F(B(t)) <
B(t)
V
 
C(t)
ˆC(t)
!
for all t.
(1)
This tells us we must pick F(V ) to be smaller than the
worst case ratio of C(t) to ˆC(t). Unfortunately, C(t)/ ˆC(t)
is tiny if the throughput is varying wildly; and since we have
to choose F without knowing the actual capacity that will
be observed, it leads to a very conservative algorithm. For
example, in Figure 1, the ratio C(t)/ ˆC(t) can be as small as
0.03 (500 kb/s < C(t) < 17 Mb/s). In other words, for this
session, we need to pick F(V ) ≤0.03 to prevent rebuﬀers,
and the video rate will be just 3% of the rate we could pick
with an accurate estimate.
Worse, if F(.) makes us pick
a rate lower than the minimum video rate available, the
constraint becomes impossible to meet.
In practice, large throughput variation within a session is
not uncommon. A random sample of 300,000 Netﬂix sessions
shows that roughly 10% of sessions experience a median
throughput less than half of the 95th percentile throughput.
When designing an ABR algorithm, the service provider
needs to choose a F(·) that works well for all customers,
with both stable and variable throughput.
An example from a Netﬂix session illustrates the problem.
Figure 4 shows an ABR algorithm that is not conservative
enough; it keeps requesting video at too high a rate after
the capacity has dropped. The client rebuﬀers and freezes
playback for 200 seconds.
But notice that the rebuﬀer is
entirely unnecessary because the available capacity C(t) is
above Rmin for the entire time series. In fact, if the network
capacity is always greater than the lowest video rate Rmin,
i.e., C(t) > Rmin, ∀t > 0, there never needs to be a rebuﬀer-
ing event — the algorithm can simply pick R(t) = Rmin so
that C(t)/R(t) > 1, ∀t > 0 and the buﬀer keeps growing.
The main reason the client does not switch is that it over-
estimates the current capacity, and the adjustment function
is not small enough to oﬀset the diﬀerence. As a result, de-
spite the fact that capacity is suﬃcient to sustain Rmin, the
client does not ﬁnd its way to that video rate in time.
2.3
The Buffer-Based Approach
The discussion above is suggestive. Despite the challenge
of ﬁnding the right adjustment, using buﬀer-based adjust-
ments in algorithms is quite appealing, because the playback
buﬀer is the exact state variable an ABR algorithm is try-
ing to control. For example, the easiest way to ensure that
the algorithm never unnecessarily rebuﬀers is to simply re-



<!-- page 4 -->

0
50
100
150
200
250
300
Time (s)
0
1000
2000
3000
4000
5000
kb/s
235
375
560
750
1050
1750
2350
3000
Video Playback Rate
0
5
10
15
20
25
30
35
40
Buffer (s)
Buffer Occupancy
Available Capacity
Rebuffer!
Streaming paused.
Streaming resumed
 after 200 seconds
Figure 4:
Being too aggressive:
A video starts
streaming at 3Mb/s over a 5Mb/s network. After
25s the available capacity drops to 350 kb/s.
In-
stead of switching down to a lower video rate, e.g.,
235kb/s, the client keeps playing at 3Mb/s. As a re-
sult, the client rebuﬀers and does not resume playing
video for 200s. Note that the buﬀer occupancy was
not updated during rebuﬀerings.
quest rate Rmin when the buﬀer approaches empty, allowing
the buﬀer to grow as long as C(t) > Rmin. Note in par-
ticular that in the scenario in the preceding section, this
approach would have avoided a rebuﬀering event. On the
other hand, as the buﬀer grows, it is safe to increase R(t)
up to the maximum video rate as the buﬀer approaches full.
This motivates our design: our starting point is a simple
algorithm design that chooses the video rate based only on
the playback buﬀer.
Inspired by this discussion, we design our algorithms as
follows. First, we focus on a pure buﬀer-based design: we
select the video rate directly as a function of the current
buﬀer level. As we ﬁnd, this approach works well when the
buﬀer adequately encodes information about the past his-
tory of capacity. However, when the buﬀer is still growing
from empty (during the ﬁrst few minutes of a session), it
does not adequately encode information about available ca-
pacity. In this phase, the pure buﬀer-based design can be
improved by leveraging a capacity estimate.
We call this design the buﬀer-based approach. This design
process leads to two separate phases of operation: During
the steady-state phase, when the buﬀer encodes adequate
information, we choose the video rate based only on the
playback buﬀer. During the startup phase, when the buﬀer
contains little information, we augment the buﬀer-based de-
sign with capacity estimation. In this way, our design might
be thought of as an “inversion” of Figure 3: namely, we be-
gin by using only the playback buﬀer, and then “adjust” this
algorithm using capacity estimation where needed.
3.
BUFFER-BASED ALGORITHMS
We say that an ABR algorithm is buﬀer-based if it picks
the video rate as a function of the current buﬀer occupancy,
B(t). The design space for this class of algorithms is ex-
pressed by the buﬀer-rate plane in Figure 5. The region be-
tween [0, Bmax] on the buﬀer-axis and [Rmin, Rmax] on the
rate-axis deﬁnes the feasible region.
Any curve f(B) on
the plane within the feasible region deﬁnes a rate map, a
Risky''
Area'
Playout&Buﬀer&Occupancy&
Next&Chunk’s&Video&Rate&
Rmin&
Rmax&
…&
Bmax&
Safe'from''
Unnecessary''
rebuﬀering'
Figure 5: Video rate as a function of buﬀer occu-
pancy.
function that produces a video rate between Rmin and Rmax
given the current buﬀer occupancy.
3.1
Theoretical Criteria for Design Goals
From this feasible region, our goal is to ﬁnd a class of map-
ping functions that can: (1) avoid unnecessary rebuﬀerings,
and (2) maximize average video rate.
To start with, we make the following simplifying assump-
tions:
1. The chunk size is inﬁnitesimal, so that we can change the
video rate continuously.
2. Any video rate between Rmin and Rmax is available.
3. Videos are encoded at a constant bit-rate (CBR).
4. Videos are inﬁnitely long.
We can show that any rate maps that are (1) continuous
functions of the buﬀer occupancy B; (2) strictly increasing
in the region {B : Rmin < f(B) < Rmax}; and (3) pinned at
both ends, i.e., f(0) = Rmin and f(Bmax) = Rmax, will meet
the two design goals. In other words, we can achieve our
goal by picking any rate map that increases the video rate
from lowest to highest as the buﬀer increases from empty to
full. The mapping function in Figure 5 is one such example.
We leave the formal proof in our technical report [8], and
we summarize the proof here:
No unnecessary rebuﬀering: As long as C(t) ≥Rmin
for all t and we adapt f(B) →Rmin as B →0, we will never
unnecessarily rebuﬀer because the buﬀer will start to grow
before it runs dry.
Average video rate maximization: As long as f(B) is
(1) increasing and (2) eventually reaches Rmax, the average
video rate will match the average capacity when Rmin <
C(t) < Rmax for all t > 0.
Next, we explore how to remove the assumptions above,
then validate the approach with the Netﬂix deployments in
Section 4, 5 and 6.
3.2
Real World Challenges
In practice, the chunk size is ﬁnite (V seconds long) and
a chunk is only added to the buﬀer after it is downloaded.
To avoid interruption, we always need to have at least one
chunk available in the buﬀer.
To handle the ﬁnite chunk
size, as well as some degree of variation in the system, we
shift the rate map to the right and create an extra reservoir,
noted as r. When the buﬀer is ﬁlling up the reservoir, i.e.,
0 ≤B ≤r, we request video rate Rmin. Once the reservoir is
reached, we then increase the video rate according to f(B).



<!-- page 5 -->

Rmin&
Rmax&
Buﬀer&&
Occupancy&&
Bmax&
Video&
Rate&
reservoir&
cushion&
R2&
R3&
…&
RmZ1&
f(B)"
Boundary&of&the&safe&area&&
r"
feasible&region&
B2& B3&
BmZ1&
&upper&
reservoir&
B1&
Bm&
Figure 6: The rate map used in the BBA-0 buﬀer-
based algorithm.
Also because of the ﬁnite chunk size, the buﬀer does not stay
at Bmax even when C(t) ≥Rmax; thus, we should allow rate
map to reach Rmax before Bmax. We call the buﬀer between
the reservoir and the point where f(B) ﬁrst reaches Rmax the
cushion, and the buﬀer after the cushion the upper reservoir.
Since many video clients have no control over TCP sockets
and they cannot cancel an ongoing video chunk download,
we can only pick a new rate when a chunk ﬁnishes arriv-
ing. If the network suddenly slows down while we are in the
middle of downloading a chunk, the buﬀer might run dry
before we get the chance to switch to a lower rate. Thus,
we need to aim to maintain the buﬀer level to be above the
reservoir r, so that there is enough buﬀer to absorb the vari-
ation caused both by the varying capacity and by the ﬁnite
chunk size.
As a result, f(B) should be designed to en-
sure a chunk can always be downloaded before the buﬀer
shrinks into the reservoir area.
Based on these observa-
tions, we say f(B) operates in the safe area if it always
picks chunks that will ﬁnish downloading before the buﬀer
runs below r, when C(t) ≥Rmin for all t. In other words,
V f(B)/Rmin ≤(B −r).
Otherwise, f(B) is in the risky
area.
Overall, the class of functions that we consider take the
piecewise form described in Figure 6.
We illustrate there
the reservoir, the cushion, and the upper reservoir. We also
illustrate the notion of safety described in the previous para-
graph: we plot the boundary of the safe area as the red
dashed line in the ﬁgure.
Any f(B) below the boundary
will be a safe choice.
In Section 4, we test this concept by deploying a baseline
algorithm with ﬁxed-size reservoir and cushion.
4.
THE BBA-0 ALGORITHM
To test the buﬀer-based approach developed in Section 3,
we ﬁrst construct a baseline algorithm with a relatively sim-
ple and naive rate map. We start the design with a piecewise
function as shown in Figure 6. We then determine the size of
reservoir, cushion, and upper reservoir, as well as the shape
of the rate map. We implement the algorithm in Netﬂix’s
browser-based player, which happens to have a 240 second
playback buﬀer and the convenient property that it down-
loads the ABR algorithm at the start of the video session.
As discussed in Section 3, the size of reservoir needs to be
at least one chunk (4 seconds in our testing environment)
to absorb the buﬀer variation caused by the ﬁnite chunk
size. However, since the algorithm is tested in a production
environment that streams VBR-encoded video, the size of
reservoir also needs to be big enough to absorb the buﬀer
variation caused by the VBR encoding. As the ﬁrst baseline
algorithm, we set the size of reservoir to be a large and
ﬁxed-size value, 90 seconds. We thought a 90s reservoir is
big enough to absorb the variation from VBR, allowing us
to focus on testing the approach developed in Section 3.
The size of cushion is deﬁned as the buﬀer distance be-
tween B1 and Bm, as shown in Figure 6. Since the buﬀer
distance between neighboring rates aﬀects the frequency of
rate switches, we maximize the size of cushion while leaving
some room for the upper reservoir. As a result, we let the
rate map reaches Rmax when the buﬀer is 90% full (216 sec-
onds). In other words, we set the cushion to be 126 seconds
(between 90 to 216 seconds) and the upper reservoir to be
24 seconds (between 216 to 240 seconds). To further max-
imize the distance between each pair of neighboring rates,
we use a linear function to increase the rate between Rmin
and Rmax. The resulting f(B) is a piecewise linear function,
which stays in the safe area deﬁned in Section 3.
Note that a rate map by itself does not fully deﬁne the
algorithm: the rate map is continuous, while streamed video
rates are discrete, Rmin, R2, R3...Rm−1, Rmax. We therefore
adapt the rate according to Algorithm 1, following a sim-
ple rule: stay at the current video rate as long as the rate
suggested by the rate map does not cross the next higher
(Rate+) or lower (Rate−) discrete video rate. If either “bar-
rier” is hit the rate is switched up or down (respectively)
to a new discrete value suggested by the rate map. In this
way, the buﬀer distance between the adjacent video rates
provides a natural cushion to absorb rate oscillations, mak-
ing the video rate a little “sticky”. This algorithm, together
with the rate map we just deﬁned, constructs our ﬁrst buﬀer-
based algorithm. We call this algorithm BBA-0 since it is
the simplest of our buﬀer-based algorithms.
4.1
Experiments
We implemented the BBA-0 algorithm in Netﬂix’s browser-
based player.
As mentioned, the video player has a 240s
playback buﬀer and downloads the ABR algorithm at the
start of the video session.
Although this player enjoys a
bigger buﬀer than players on embedded devices, it does not
have visibility into, or control of, the network layer. We ran-
domly picked three groups of users from around the world
to take part in the experiments between September 6th (Fri-
day) and 9th (Monday), 2013.
Group 1 is our Control group and they use Netﬂix’s then-
default ABR algorithm.2 The Control algorithm has steadily
improved over the past ﬁve years to perform well under many
conditions. The Control algorithm directly follows the de-
sign in Figure 3: it picks a video rate primarily based on
capacity estimation, with buﬀer occupancy as a secondary
signal. It is representative of how video streaming services
work; e.g. Hulu [9] and YouTube [21] are based on capacity
estimation. Netﬂix traﬃc represents 35% of the US peak
Internet traﬃc and they serve 40 million users world-wide.
For these reasons, we believe the Netﬂix Control algorithm
is a reasonable algorithm to compare against.
Group 2 always stream at Rmin, and we call this degener-
ate algorithm Rmin Always. Always operating at the lowest
2The ABR algorithm in commercial services keeps evolving,
and so Netﬂix’s current algorithm is now diﬀerent.



<!-- page 6 -->

Algorithm 1: Video Rate Adaptation Algorithm
Input: Rateprev: The previously used video rate
Bufnow: The current buﬀer occupancy
r: The size of reservoir
cu: The size of cushion
Output: Ratenext: The next video rate
if Rateprev = Rmax then
Rate+ = Rmax
else
Rate+ = min{Ri : Ri > Rateprev}
if Rateprev = Rmin then
Rate−= Rmin
else
Rate−= max{Ri : Ri < Rateprev}
if Bufnow ≤r then
Ratenext = Rmin
else if Bufnow ≥(r + cu) then
Ratenext = Rmax
else if f(Bufnow) ≥Rate+ then
Ratenext = max{Ri : Ri < f(Bufnow)};
else if f(Bufnow) ≤Rate−then
Ratenext = min{Ri : Ri > f(Bufnow)};
else
Ratenext = Rateprev;
return Ratenext;
video rate minimizes the chances of the buﬀer running dry,
giving us a lower bound on the rebuﬀer rate to compare new
algorithms against. For most sessions Rmin = 560kb/s, but
in some cases it is 235kb/s.3
Group 3 uses our new BBA-0 algorithm.
All three user groups are distributed similarly across ISPs,
geographic locations, viewing behaviors and devices. The
only diﬀerence between the three groups of clients is the
rate selection algorithm; they share the same code base for
other mechanisms, such as prebuﬀering, CDN selection, and
error handling. As a result, all three groups share similar
join delay and error rate, allowing us to concentrate on the
quality metrics during playback.
Even though testing against a range of other complex al-
gorithms would not be possible in this testing environment,
it’s unprecedented to be able to report video performance re-
sults from a huge commercial service, such as Netﬂix, and we
believe the insight it oﬀers into a real system is invaluable.
During our experiments each group of users viewed roughly
120, 000 hours of video. To compare their performance, we
measure the overall number of rebuﬀers per playhour and
the average delivered video rate in each group.
4.2
Results
Rebuﬀer Rate. Figure 7(a) plots the number of rebuﬀers
per playhour throughout the day. Figure 7(b) simpliﬁes a
visual comparison between algorithms by normalizing the
average rebuﬀer rate to the Control group in each two-hour
3In our service, Rmin is normally 235kb/s. However, most
customers can sustain 560kb/s, especially in Europe. If a
user historically sustained 560kb/s we artiﬁcially set Rmin =
560kb/s to avoid degrading the video experience too far.
The mechanism to pick Rmin is the same across all three
test groups.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
Number of Rebuffers per Hour
Peak Hours
Rmin Always
Control
BBA-0
(a) Number of rebuﬀers per playhour during the day.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
40
50
60
70
80
90
100
110
120
Normalized Number of Rebuffers per Hour (%)
Peak Hours
Rmin Always
Control
BBA-0
(b) Normalized number of rebuﬀers per playhour, nor-
malized to the average rebuﬀer rate of Control in each
two hour period.
Figure 7: Number of rebuﬀers per playhour for the
Control, Rmin Always, and BBA-0 algorithms. The
error bars represent the variance of rebuﬀer rates
from diﬀerent days in the same two-hour period.
period. Peak viewing hours for the USA are highlighted in
yellow. Error bars represent the variance of rebuﬀer rates
from diﬀerent days in the same two-hour period. The Rmin
Always algorithm provides an empirical lower bound on the
rebuﬀer rate.
Note that because the users in the three
groups are diﬀerent and their environments are not exactly
the same, Rmin Always only approximates the lower bound
for the other groups. The ﬁrst thing to notice from the ﬁgure
is that Rmin Always and BBA-0 always have a lower rebuﬀer
rate than the Control algorithm. The diﬀerence between the
Control algorithm and the Rmin Always algorithm suggests
that 20–30% of the rebuﬀers might be caused by poor choice
of video rate.
During the middle-of-night period in the USA just af-
ter peak viewing (6am–12pm GMT), BBA-0 matches the
Rmin Always lower bound very closely. At 10am GMT, even
though BBA-0 has a lower average rebuﬀer rate than Rmin
Always, the diﬀerence is not statistically signiﬁcant.4 These
two algorithms perform equally during this oﬀ-peak period,
because the viewing rate is relatively low, overall Internet
usage is low, and the network capacity for individual ses-
sions does not change much. The rebuﬀer rate during these
4The hypothesis of BBA-0 and Rmin Always share the same
distribution is not rejected at the 95% conﬁdence level (p-
value = 0.25).



<!-- page 7 -->

0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
¡200
¡150
¡100
¡50
0
50
100
Video Rate Difference (kb/s)
Peak Hours
Control
BBA-0
Figure 8: Comparison of video rate between Control
and BBA-0. The error bars represent the variance
of video rates from diﬀerent days in the same two-
hour period. The Y-axis shows the diﬀerence in the
delivered video rate between Control and BBA-0.
hours is dominated by random local events, such as WiFi
interference, instead of congested networks.
During peak hours, the performance with BBA-0 is sig-
niﬁcantly worse than with the Rmin Always algorithm. Nev-
ertheless, the BBA-0 algorithm consistently has a 10–30%
lower rebuﬀer rate than the Control algorithm. This perfor-
mance diﬀerence is encouraging given the extremely simple
nature of the BBA-0 algorithm. Still, we hope to do better.
In Section 5 and 6, we will develop techniques to improve
the rebuﬀer rate of buﬀer-based algorithms.
Video Rate. Figure 8 shows the diﬀerence in the deliv-
ered video rate between Control and BBA-0. The daily av-
erage bitrate for the Control algorithm for each ISP can
be found in the Netﬂix ISP Speed Index [18]. Since Rmin
Always always streams at Rmin (except when rebuﬀering),
its delivered video rate is a ﬂat line and is excluded from
the ﬁgure. The BBA-0 algorithm is roughly 100kb/s worse
than the Control algorithm during peak hours, and 175kb/s
worse during oﬀ-peak hours. There are two main reasons
for the degradation in video quality. First, our BBA-0 algo-
rithm uses a large and ﬁxed-size reservoir to handle VBR,
while the size of reservoir should be adjusted to be just big
enough to absorb the variation introduced by VBR. Second,
and more signiﬁcantly, while the reservoir is ﬁlling up dur-
ing the startup period, our BBA-0 algorithm always requests
video at rate Rmin. Given that we picked a 90s reservoir, it
downloads 90 seconds worth of video at rate Rmin, which is
a non-negligible fraction of the average session length. We
will address both issues in Section 5 and 6.
Video Switching Rate.
Since our BBA-0 algorithm
picks the video rate based on the buﬀer level, we can expect
the rate to ﬂuctuate as the buﬀer occupancy changes. How-
ever, Algorithm 1 uses the distance between adjacent video
rates to naturally cushion, and absorb, rate oscillations. Fig-
ure 9 compares BBA-0 with the Control algorithm. Note the
numbers are normalized to the average switching rate of the
Control group for each two-hour period.
The BBA-0 al-
gorithm reduces the switching rate by roughly 60% during
peak hours, and by roughly 50% during oﬀ-peak hours.
In summary, BBA-0 conﬁrms that we can reduce the re-
buﬀer rate by focusing on buﬀer occupancy.
The results
also show that the buﬀer-based approach is able to reduce
the video switching rate. However, BBA-0 performs worse
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
30
40
50
60
70
80
90
100
110
120
Normalized Bitrate Changes Per Playhour (%)
Peak Hours
Control
BBA-0
Figure 9: Average video switching rate per two hour
window for the Control and BBA-0 algorithms. The
numbers are normalized to the average switching
rate of the Control for each window.
0
500
1000
1500
2000
Time (s)
0
500
1000
1500
2000
2500
3000
3500
Chunk Size (KByte)
Figure 10: The size of 4-second chunks of a video
encoded at an average rate of 3Mb/s. Note the av-
erage chunk size is 1.5MB (4s times 3Mb/s).
on video rate compared to the Control algorithm. In the
next section, we will develop techniques to improve both re-
buﬀer rate and video rate by considering the VBR encoding
scheme.
5.
HANDLING VARIABLE BITRATE (VBR)
In Section 4, the BBA-0 algorithm attempts to handle
VBR by setting the reservoir size to a large and somewhat
arbitrary value. Although we are able to get a signiﬁcant
reduction in rebuﬀering compared to the Control, there is
still room to improve when comparing to the empirical lower
bound. In addition, the average video rate achieved by the
BBA-0 algorithm is signiﬁcantly lower than the Control algo-
rithm. In this section, we will discuss techniques to improve
both rebuﬀer rate and video rate by taking the encoding
scheme into consideration. A key advance is to design the
reservoir based on the instantaneous encoding bitrate of the
stream being delivered.
In practice, most of the video streaming services encode
their videos in variable bitrate (VBR). VBR encodes static
scenes with fewer bits and active scenes with more bits, while
maintaining a consistent quality throughout the video. VBR
encodings allow more ﬂexibility and can use bits more eﬃ-
ciently. When a video is encoded in VBR at a nominal video
rate, the nominal rate represents the average video rate, and



<!-- page 8 -->

C[k]
R[k]
B[k]&
Input&
Rate&
Buﬀer&Size&
(seconds)&
Output&
Rate&
Buﬀer&
Occupancy&
(seconds)&
1&
ChunkSize
c[k]
V&
B(t)&
Output&
Per&Chunk&
Input&
Per&Chunk&
Figure 11: Two equivalent models of the streaming
playback buﬀer.
Rmin&
kb/s&
The&amount&of&
buﬀer&we&need&
in&order&to&
avoid&rebuﬀer&
The&amount&of&
buﬀer&we&can&
resupply&during&
this&period&
X&seconds&
Time&(s)&
Figure 12: Reservoir calculation: We calculate the
size of the reservoir from the chunk size variation.
the instantaneous video rate varies around the average value.
As a result, the chunk size will not be uniformly identical
in a stream of a given rate.
Figure 10 shows the size of
4-second chunks over time from a production video (Black
Hawk Down) encoded at 3 Mb/s. The black line represents
the average chunk size. As we can see from the ﬁgure, the
variation on chunk size can be signiﬁcant within a single
video rate.
Given the variation on chunk size, we need to take the size
of each chunk into consideration and re-consider the buﬀer
dynamics under VBR. Because we can only select video rates
on a chunk-by-chunk basis, it is useful to consider the buﬀer
dynamics when observed at the time points when a chunk
ﬁnishes, as shown in Figure 11. Let r[k] be the video rate
selected for the k-th chunk and c[k] be the average system
capacity during the download of the k-th chunk. For the k-th
chunk from the stream of nominal video rate r, we denote the
chunk size as Chunk[r][k]. Since each chunk still contains
V seconds of video, the buﬀer now drains Chunk[r][k]/c[k]
seconds while it ﬁlls with V seconds of video.
5.1
Reservoir Calculation
Since the instantaneous video rate can be much higher
than the nominal rate in VBR, we could still encounter a
rebuﬀer event even when the capacity c[k] is exactly equal
to Rmin, unless we have enough buﬀer to absorb the buﬀer
oscillation caused by the variable chunk size. Thus, the size
of reservoir should be big enough to ensure the client can
continue playing at Rmin when c[k] = Rmin.
Rmin&
Rmax&
Buﬀer&Occupancy&&
Bmax&
Video&&
Rate&
reservoir&
cushion&
R2&
R3&
…&
RmZ1&
feasible&region&
f(B)"
Boundary&of&the&safe&area&&
Chunk&
Size&
Chunkmin&
Chunkmax&
r"
Figure 13:
Handling VBR with chunk maps.
To
consider variable chunk size, we generalize the con-
cept of rate maps to chunk maps by transforming
the Y-axis from video rates to chunk sizes.
Assuming c[k] = Rmin, when the chunk size is larger than
the average, V Rmin, the video client will consume more
video in the buﬀer than the input. On the other hand, when
the chunk size is lower than the average, the buﬀer is con-
sumed more slowly than the input and the buﬀer occupancy
will increase. Thus, by summing up the amount of buﬀer
the client will consume minus the amount it can resupply
during the next X seconds, we can ﬁgure out the amount
of reservoir we need. We dynamically adjust the reservoir
based on this prospective calculation over the lifetime of the
stream. X should be set at least as the size of the playout
buﬀer, since users expect the service to continue for that
period even when bandwidth drops. Figure 12 summarizes
how the calculation is done. In the implementation, we set
X as twice of the buﬀer size, i.e., 480 seconds.
The cal-
culated reservoir size depends highly on the speciﬁc video
and the playing segment. For example, when playing static
scenes such as opening credits, since they are encoded with
very few bits, the calculated reservoir size is negative; when
playing active scenes that are encoded with much more bits,
the calculated reservoir size can be even larger than half the
buﬀer size (120 seconds). As a practical matter, we bound
the size of reservoir to be between 8 seconds to 140 seconds.
5.2
Chunk Map
Since the buﬀer dynamics now depend on the chunk size
of the upcoming video segments instead of the video rate, it
makes more sense to map the buﬀer occupancy to the chunk
size directly. In other words, we can generalize the design
space and change it from the buﬀer-rate plane to the buﬀer-
chunk plane as shown in Figure 13. Each curve in the ﬁgure
now deﬁnes a chunk map, which represents the maximally al-
lowable chunk size according to the buﬀer occupancy. In the
ﬁgure, the feasible region is now deﬁned between [0, Bmax]
on the buﬀer-axis and [Chunkmin, Chunkmax] on the chunk-
axis, where Chunkmin and Chunkmax represent the average
chunk size in Rmin and Rmax, respectively.
We can now generalize Algorithm 1 to use the chunk map:
the algorithm stays at the current video rate as long as the
chunk size suggested by the map does not pass the size of
the next upcoming chunk at the next highest available video
rate (Rate+) or the next lowest available video rate (Rate−).
If either of these “barriers” are passed, the rate is switched
up or down, respectively. Note that by using the chunk map,



<!-- page 9 -->

0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
Number of Rebuffers per Hour
Peak Hours
Rmin Always
Control
BBA-1
BBA-0
(a) Number of rebuﬀers per playhour throughout the
day.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
40
50
60
70
80
90
100
110
120
Normalized Number of Rebuffers per Hour (%)
Peak Hours
Rmin Always
Control
BBA-1
(b) Normalized number of rebuﬀers per playhour. Each
percentage is normalized to the average rebuﬀer rate of
the Control algorithm in a two-hour period.
Figure 14:
The BBA-1 algorithm achieves close-
to-optimal rebuﬀer rate, especially during the peak
hours.
we no longer have a ﬁxed mapping between buﬀer levels and
video rates. This could result in a higher frequency of video
rate switches.
We will explore techniques to address this
issue in Section 7.
5.3
Results
We use the same setup as in Section 4.
We select the
same number of users in each group to use our VBR-enabled
buﬀer-based algorithm, which dynamically calculates the
reservoir size and uses a chunk map. We will refer to the
algorithm as BBA-1 in the following, as it is our second it-
eration of the buﬀer-based algorithm. This experiment was
conducted along with the experiment in Section 4 between
September 6th (Friday) and 9th (Monday), 2013.
Figure 14(a) shows the rebuﬀer rate in terms of number of
rebuﬀers per playhour, while Figure 14(b) normalizes to the
average rebuﬀer rate of the Control in each two-hour period.
We can see from the ﬁgure that the BBA-1 algorithm comes
close to the optimal line and performs better than the BBA-
0 algorithm. BBA-1 has a lower average rebuﬀer rate than
Rmin Always during 4–6am GMT, but the diﬀerence is not
statistically signiﬁcant.5 The improvement over the Control
algorithm is especially clear during peak hours, where the
5The hypothesis of BBA-1 and Rmin Always share the same
distribution is not rejected at the 95% conﬁdence level (p-
value = 0.74).
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
¡200
¡150
¡100
¡50
0
50
100
Video Rate Difference (kb/s)
Peak Hours
Control
BBA-1
Figure 15:
The BBA-1 algorithm improved video
rate by 40–70 kb/s compare to BBA-0, but still 50–
120 kb/s away from the Control.
0
50
100
150
200
250
300
Video Time (s)
0
500
1000
1500
2000
2500
3000
3500
Video Rate (kb/s)
235
375
560
750
1050
1750
2350
3000
BBA-1
BBA-2
Figure 16:
Typical time series of video rates for
BBA-1 (red) and BBA-2 (blue). BBA-1 follows the
chunk map and ramps slowly. BBA-2 ramps faster
and reaches the steady-state rate sooner.
BBA-1 algorithm provides a 20–28% improvement in the
rebuﬀer rate.
Figure 15 shows the diﬀerence in the average video rate
between the Control, BBA-0, and BBA-1 algorithms.
As
shown in Figure 15, the BBA-1 algorithm also improves the
video rate compared to BBA-0 by 40–70kb/s on average,
although it is still 50–120kb/s away from the Control al-
gorithm.
This discrepancy in video rate comes from the
startup period, when the buﬀer is still ﬁlling up. If we com-
pare the average video rate of the ﬁrst 60 seconds between
the BBA-1 algorithm and the Control algorithm, the BBA-
1 algorithm achieves 700kb/s less than the Control. Before
the client builds up its buﬀer to the size of the reservoir,
the BBA-1 algorithm will always request for Rmin, as it is
the only safe rate given the buﬀer occupancy. In the next
section, we will further improve the video rate by entering
into the risky area and develop techniques to minimize the
risk.
6.
THE STARTUP PHASE
As discussed in the previous section, most of the diﬀer-
ences in video rate between BBA-1 and the Control algo-
rithm can be accounted for by the startup phase, i.e., after



<!-- page 10 -->

starting a new video or seeking to a new point.6
During
the startup phase, the playback buﬀer starts out empty and
carries no useful information to help us choose a video rate.
BBA-1 follows the usual chunk map, starting out with a
low video rate since the buﬀer level is low.
It gradually
increases the rate as the buﬀer ﬁlls, as shown by the red
line in Figure 16. BBA-1 is too conservative during startup.
The network can sustain a much higher video rate, but the
algorithm is just not aware of it yet.
In this section, we test the following hypothesis. During
the startup, we can improve the video rate by entering into
the risky area; in the steady state, we can improve both
video rate and rebuﬀer rate by using a chunk map. Our next
algorithm, BBA-2, tries to be more aggressive during the
startup phase, by incorporating a simple capacity estimation
into the startup behavior. When possible, BBA-2 ramps up
quickly and ﬁlls the buﬀer with a much higher rate than
what the map suggests.
This two phases of operation can be found in many net-
work protocols, such as the slow-start and congestion avoid-
ance phases in TCP. For TCP, when a connection starts,
the congestion control algorithm knows nothing about net-
work conditions from the sending window, and the window
is quickly opened to use available capacity until packet losses
are induced. Similar to TCP, ABR algorithms get little or
no information from the playback buﬀer at the beginning
of a session. However, while ABR algorithms also ramp up
the video rate quickly, unlike TCP, they need to do it in a
controlled manner to prevent unnecessary rebuﬀers.
From Figure 11, we know that the change of the buﬀer,
∆B = V −(ChunkSize/c[k]), captures the diﬀerence be-
tween the instantaneous video rate and system capacity.
Now, assuming the current video rate is Ri, to safely step
up a rate, c[k] needs to be at least Ri+1 to avoid rebuﬀers.
In other words, we require ∆B ≥V −(ChunkSize/Ri+1).
Further, since videos are encoded in VBR, the instantaneous
video rate can be much higher than the nominal rate. Let
the max-to-average ratio in a VBR stream be e, so that
eRi+1 represents the maximum instantaneous video rate in
Ri+1. When the player ﬁrst starts up, since there is no buﬀer
to absorb the variation, c[k] needs to be at least larger than
eRi+1 in order to safely step up a rate. In other words, when
considering VBR and the buﬀer is empty, ∆B needs to be
larger than V −(ChunkSize/(eRi+1)) for the algorithm to
safely step up from Ri to Ri+1.
According to Figure 10,
the max-to-average ratio e is around 2 in our system. Since
e = 2, Ri/Ri+1 ∼2, and a chunk size can be smaller than
half the average chunk size (ChunkSize ≤0.5V Ri), ∆B
needs to be larger than 0.875V s to safely step up a rate
when the buﬀer is empty in our system.
Based on the preceding observation, BBA-2 works as fol-
lows. At time t = 0, since the buﬀer is empty, BBA-2 only
picks the next highest video rate, if the ∆B increases by
more than 0.875V s.
Since ∆B = V −ChunkSize/c[k],
∆B > 0.875V also means that the chunk is downloaded
eight times faster than it is played. As the buﬀer grows, we
use the accumulated buﬀer to absorb the chunk size variation
and we let BBA-2 increase the video rate faster. Whereas at
the start, BBA-2 only increases the video rate if the chunk
downloads eight times faster than it is played, by the time
6Note that the startup phase does not refer to the join delay.
The startup phase refers to the ﬁrst few minutes after the
video has started.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
¡200
¡150
¡100
¡50
0
50
100
Video Rate Difference (kb/s)
Peak Hours
Control
BBA-1
BBA-2
Figure 17: BBA-2 achieved a similar video rates to
the Control algorithm overall.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
¡200
¡150
¡100
¡50
0
50
100
Video Rate Difference 
 Excluding the First 120 seconds 
 (kb/s)
Peak Hours
Figure 18: BBA-2 achieved better video rate at the
steady state.
The steady state is approximated as
the period after the ﬁrst two minutes in each session.
it ﬁlls the cushion, BBA-2 is prepared to step up the video
rate if the chunk downloads twice as fast as it is played. The
threshold decreases linearly, from the ﬁrst chunk until the
cushion is full.
The blue line in Figure 16 shows BBA-2
ramping up faster. BBA-2 continues to use this startup al-
gorithm until (1) the buﬀer is decreasing, or (2) the chunk
map suggests a higher rate. Afterwards, we use the f(B)
deﬁned in the BBA-1 algorithm to pick a rate.
Note that BBA-2 is using ∆B during startup, which en-
codes a simple capacity estimate: the throughput of the last
chunk. This design helps make the algorithm more aggres-
sive at a point when the buﬀer has not yet accumulated
enough information to accurately determine the video rate
to use. Nevertheless, note that our use of capacity estima-
tion is restrained. We only look at the throughput of the
last chunk, and crucially, once the buﬀer is built up and
the chunk map starts to suggest a higher rate, BBA-2 be-
comes buﬀer-based—it picks a rate from the chunk map, in-
stead of using ∆B. In this way, BBA-2 enables us to enjoy
the improved steady-state performance of the buﬀer-based
approach, without sacriﬁcing overall bitrate due to a slow
startup ramp.
6.1
Results
We ran our experiments during the same time period and
with the same pool of users as the previously described ex-
periments, which all occurred between September 6th (Fri-
day) and 9th (Monday), 2013. Figure 17 shows the diﬀer-



<!-- page 11 -->

0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
Number of Rebuffers per Hour
Peak Hours
Rmin Always
Control
BBA-1
BBA-2
(a) Number of rebuﬀers per playhour throughout the
day.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
40
50
60
70
80
90
100
110
120
Normalized Number of Rebuffers per Hour (%)
Peak Hours
Rmin Always
Control
BBA-1
BBA-2
(b) Normalized number of rebuﬀers per playhour, the
number is normalized to the average rebuﬀer rate of the
Control in each two hour period.
Figure 19: BBA-2 has a slightly higher rebuﬀer rate
compared to BBA-1, but still achieved 10–20% im-
provement compared to the Control algorithm dur-
ing peak hours.
ence in the average video rate between Control, BBA-1, and
BBA-2. From the ﬁgures, we see that BBA-2 does indeed
increase the video rate. With a faster startup-phase ramp,
the video rate with BBA-2 is almost indistinguishable from
the Control algorithm. This supports our hypothesis that
the lower video rates seen by BBA-0 and BBA-1 were due
to their conservative rate selection during startup. Further-
more, if we exclude the ﬁrst two minutes as an approxima-
tion of the steady state, the average video rate of BBA-2
is mostly higher than Control, as shown in Figure 18. This
observation veriﬁes our discussion in Section 3: The buﬀer-
based approach is able to better utilize network capacity and
achieve higher average video rate in the steady state.
Figure 19 shows absolute and normalized rebuﬀers. BBA-
2 slightly increases the rebuﬀer rate. BBA-2 operates in the
risky zone of Figure 13 and therefore will inevitably rebuﬀer
more often than BBA-1, which only operates in the safe
area. Nevertheless, the improvements are signiﬁcant rela-
tive to Control: BBA-2 maintains a 10–20% improvement
in rebuﬀer rate compared to the Control algorithm during
peak hours.
So far, we have successfully relaxed the four idealized as-
sumptions made in Section 3.
In BBA-0, we handle the
ﬁnite chunk size and discrete available video rates through
a piecewise mapping function.
In BBA-1, we handle the
VBR encoding through a variable reservoir size and a chunk
map. In BBA-2, we further handle the ﬁnite video length
by dividing each session into two phases. BBA-2 still follows
the buﬀer-based approach in the steady state, and it uses a
simple capacity estimation to ramp up the video rate dur-
ing the startup. The results demonstrate that by focusing
on the buﬀer, we can reduce the rebuﬀer rate without com-
promising the video rate. In fact, the buﬀer-based approach
improves the video rate in the steady state.
In the following section, we will further discuss how to
extend the buﬀer-based approach to tackle other practical
concerns.
7.
OTHER PRACTICAL CONCERNS
In this section, we extend the buﬀer-based approach and
develop techniques to address two other practical concerns:
temporary network outage and frequent video switches.
7.1
Handling Temporary Network Outage
We have shown that buﬀer-based algorithms never need to
rebuﬀer if the network capacity is always higher than Rmin.
In this section we explore what happens if the network ca-
pacity falls below Rmin, for example during a complete net-
work outage. Temporary network outages of 20–30s are not
uncommon; e.g., when a DSL modem retrains or a WiFi net-
work suﬀers interference. To make buﬀer-based algorithms
resilient to brief network outages, we can reserve part of the
buﬀer by shifting the chunk map curve further to the right.
The buﬀer will now converge to a higher occupancy than
before, providing some protection against temporary net-
work outage. We call this extra portion of buﬀer the outage
protection.
How should we allocate buﬀers to outage protection? One
way is to gradually increase the size of outage protection
after each chunk is downloaded. In the implementation of
BBA-1, we accumulate outage protection by 400ms for each
chunk downloaded when the buﬀer is increasing and still
less than 75% full.
In the implementation of BBA-2, we
only accumulate outage protection after the algorithm exits
the startup phase and is using the chunk map algorithm.
A typical amount of outage protection is 20–40 seconds at
steady state and is bounded at 80 seconds. The downside of
this approach is that the chunk map keeps moving, and can
cause video rates to oscillate.
In the following, we describe an alternative way to protect
against temporary network outage, while reducing changes
to the chunk map, by combining it with the dynamic reser-
voir calculation.
7.2
Smoothing Video Switch Rate
In Section 5, we showed that we can improve the video
rate by using a chunk map and dynamic reservoir calcu-
lation. However, this choice makes the video rate change
frequently, as shown in Figure 20.
Note that it is debat-
able as to whether video switching rate really matters to the
viewer’s quality of experience. For example, if a service of-
fers closely spaced video rates, the viewer might not notice a
switch. Nevertheless, in the following we will explore mecha-
nisms to reduce the switching rate and introduce a modiﬁed
algorithm, BBA-Others, to address this issue. We will see
that by smoothing the changes, we can at least match the
switching rate of the Control algorithm.



<!-- page 12 -->

0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
40
60
80
100
120
140
160
180
200
Normalized Bitrate Changes Per Playhour (%)
Peak Hours
Control
BBA-1
BBA-2
Figure 20: After switching from using a rate map
to using a chunk map, the video switching rate of
BBA-1 and BBA-2 is much higher than the Control
algorithm.
f(B(t))&
Chunk&Size&
Time&(s)
R3&
R2&
R1&
Figure 21:
A reason using chunk map increases
video switching rate.
When using a chunk map,
even if the buﬀer level and the mapping function re-
mains constant, the variation of chunk sizes in VBR
streams can make a buﬀer-based algorithm switch
between rates. The lines in the ﬁgure represent the
chunk size over time from three video rates, R1, R2,
and R3. The crosses represent the points where the
mapping function will suggest a rate change.
There are two main reasons our buﬀer-based algorithms
increase the frequency of video-rate switches. First, when we
use the chunk map, there is no longer a ﬁxed mapping func-
tion between buﬀer levels and video rates. Instead, buﬀer
levels are mapped to chunk sizes, and the nominal rate might
change every time we request a new chunk. Even if the buﬀer
level remains constant, the chunk map will cause BBA-1 to
frequently switch rates, since the chunk size in VBR encod-
ing varies over time, as illustrated in Figure 21.
We can
reduce the chance of switching to a new rate—and then
switching quickly back again—by looking ahead to future
chunks. When encountering a small chunk followed by some
big chunks, even if the chunk map tells us to step up a rate,
our new algorithm BBA-Others will not do so to avoid a
likely step down in the near future. The further this modi-
ﬁed algorithm looks ahead, the more it can smooth out rate
changes. If, in the extreme, we look ahead to the end of the
movie, it is the same as using a rate map instead of a chunk
map. In the implementation of BBA-Others, we look ahead
the same number of chunks as what we have in the buﬀer.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
40
60
80
100
120
140
160
Normalized Bitrate Changes Per Playhour (%)
Peak Hours
BBA-Others
Control
Figure 22: BBA-Others smoothes the frequency of
changes to the video rate, making it similar to the
Control algorithm.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
¡200
¡150
¡100
¡50
0
50
100
Video Rate Difference (kb/s)
Peak Hours
Control
BBA-Others
Figure 23: BBA-Others achieves a similar video rate
during the peak hours but reduces the video rate by
20–30kb/s during the oﬀ-peak.
When the buﬀer is empty, we pick a rate by only looking at
the next chunk; when the buﬀer is full, we look ahead for
the next 60 chunks.7 Note that BBA-Others only smooths
out increases in video rate. It does not smooth decreases so
as to avoid increasing the likelihood of rebuﬀering.
To explain the second reason, we look at Figure 12. The
size of the reservoir is calculated from the chunk size vari-
ation in the next 480 seconds.
As a result, the reservoir
will shrink and expand depending on the size of upcoming
chunks. If large chunks are coming up, the chunk map will be
right-shifted, and if small chunks are coming up, the chunk
map will be left-shifted.
Even if the buﬀer level remains
constant, a shifted chunk map might cause the algorithm
to pick a new video rate. On top of this, as described in
Section 7.1, a gradual increase in outage protection will also
gradually right-shift the chunk map. Hence, we reduce the
number of changes by only allowing the chunk map to shift
to the right, never to the left, i.e., the reservoir expands but
never shrinks. Since the reservoir cannot be shrinked, the
reservoir grows faster than it needs to, letting us use the
excess for outage protection.
7.3
Results
As before, we randomly pick three groups of real users for
our experiment. One third are in the Control group, one
7Our buﬀer size is 240 seconds and each chunk is 4 seconds.



<!-- page 13 -->

0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
Number of Rebuffers per Hour
Peak Hours
Control
Rmin Always
BBA-Others
(a) Number of rebuﬀers per playhour throughout the
day.
0
2
4
6
8
10
12
14
16
18
20
22
Hours in GMT
40
50
60
70
80
90
100
110
120
Normalized Number of Rebuffers per Hour (%)
Peak Hours
Control
Rmin Always
BBA-Others
(b) Normalized number of rebuﬀers per playhour, the
number is normalized to the average rebuﬀer rate of the
Control in each two hour period.
Figure 24: BBA-Others reduces rebuﬀer rate by 20–
30% compared to the Control algorithm.
third always stream at Rmin, giving us an approximation
of the lower bound on rebuﬀer rate, and one third run the
BBA-Others algorithm, which smooths the switching rate
by looking ahead and by only allowing the chunk map to
be right-shifted.
The experiment was conducted between
September 20th (Friday) and 22nd (Sunday), 2013.
Figure 22 shows that the video rate changes much less
often with BBA-Others than with BBA-1 or BBA-2 (Fig-
ure 20).
In fact, BBA-Others is almost indistinguishable
from Control—sometimes higher, sometimes lower.8
Fig-
ure 23 shows the video rate for BBA-Others. Since we does
not allow the chunk map to be left-shifted, BBA-Others
switches up more conservatively than BBA-2. Although the
video rate is almost the same as Control, we trade about
20kb/s of video rate compared to BBA-2 in Figure 17.9 As
other buﬀer-based algorithms, BBA-Others improves the re-
buﬀer rate, since we do not change the frequency of switches
to a lower rate. As shown in Figure 24, BBA-Others im-
proves the rebuﬀer rate by 20–30% compares to the Control
algorithm.
8The numbers are normalized to the average switching rate
in Control for each two-hour window.
9This is only an approximation, since the experiments in
Figure 23 and 17 ran in two diﬀerent weekends in September,
2013.
8.
RELATED WORK
Understanding the Impact of Inaccurate Estimates.
Prior works have shown that sudden changes in available
network capacity confuse existing ABR algorithms, causing
the algorithms to either overestimate or underestimate the
available network capacity [1, 2, 6, 10, 12].
The overestimation leads to unnecessary rebuﬀers [2, 6].
In this paper, we quantify how often unnecessary rebuﬀers
happen in a production system and show that 20–30% of re-
buﬀers are unnecessary. Based on this observation, we then
propose the buﬀer-based approach to reduce unnecessary re-
buﬀers.
The underestimation not only ﬁlls the buﬀer with video
chunks of lower quality, but also leads to the ON-OFF traf-
ﬁc pattern in video traﬃc: when the playback buﬀer is full,
the client pauses the download until there is space. In the
presence of competing TCP ﬂows, the ON-OFF pattern can
trigger a bad interaction between TCP and the ABR algo-
rithm, causing a further underestimate of capacity and a
downward spiral in video quality [9]. When competing with
other video players, overlapping ON-OFF periods can con-
fuse capacity estimation, leading to oscillating quality and
unfair link share among players [1, 10, 12].
In our work, since we request only Rmax when the buﬀer
approaches full, the ON-OFF traﬃc pattern appears only
when the available capacity is higher than Rmax.
When
competing with a long-lived TCP ﬂow, our algorithm con-
tinues to request Rmax when the ON-OFF pattern occurs,
avoiding the downward spiral. When competing with other
video players, if the buﬀer is full, all players have reached
Rmax, and so the algorithm is fair.
Buﬀer-aware ABR Algorithms.
Others have pro-
posed using buﬀer level to adjust capacity estimation. Tian
et al. [20] uses a buﬀer and a PID controller to compute the
adjustment function applied to capacity estimates, balanc-
ing responsiveness and smoothness. Elastic [5] ﬁrst measures
the network capacity through a harmonic ﬁlter, then drives
the buﬀer to a set-point through a controller. These prior
works reveal that buﬀer occupancy provides important infor-
mation for selecting a video rate. In this paper, we observe
that buﬀer occupancy is in fact the primary state variable
that an ABR algorithm should control. This motivates a
design that directly chooses the video rate according to the
current buﬀer occupancy, and uses simple capacity estima-
tion only when the buﬀer itself is growing from empty.
Quality Metrics and User Engagement.
User en-
gagement and quality of experience (QoE) are known to
depend on rebuﬀering rate and video rate [7, 11, 14], as
well as the delay before playing and how often the video
rate changes [7, 19]. Modeling user engagement is complex
and on-going [4, 14]. In this work, we focus on the tradeoﬀ
between rebuﬀer events and video bitrate (with some con-
sideration for switching rate).
The buﬀer-based approach
can serve as a foundation when considering other metrics.
Improving QoE through other system designs. Client-
side ABR algorithms try to make the best decision based on
local observations. Their distributed nature yields system
scalability, and arguably each client has the best position to
observe local events. However, the decisions of these algo-
rithms are reactive and optimize only the performance of a
single client. Thus, a centralized control plane is proposed to
optimize the global performance through aggregating mea-
surements [13]. The potential beneﬁts from CDN augmenta-



<!-- page 14 -->

tion mechanisms, such as CDN federation and peer-assisted
CDN-P2P hybrid model, are also investigated [3]. Our work
is complementary to these eﬀorts and will beneﬁt from them.
9.
CONCLUSION
Existing ABR algorithms face a signiﬁcant challenge in
environments where the capacity is rapidly varying (as is
observed in practice). In response, ABR algorithms often
adjust the capacity estimate based on the buﬀer occupancy,
becoming more conservative (resp., aggressive) as the buﬀer
falls (resp., grows). Motivated by the observation that accu-
rate estimation is challenging when capacity is highly vari-
able, we take this design to an extreme: we directly choose
the video rate based on the current buﬀer occupancy and
only use estimation when necessary. Our own investigation
reveals that capacity estimation is unnecessary in steady
state; however using (simple) capacity estimation (based on
immediate past throughput) is important during the startup
phase, when the buﬀer occupancy is growing from empty.
We test the viability of this approach through a deploy-
ment in Netﬂix, and the results show that our algorithm
can achieve a signiﬁcant performance improvement.
More generally, our work suggests an alternative roadmap
for the development of ABR algorithms: rather than pre-
suming that capacity estimation is required, it is perhaps
better to begin by using only the buﬀer, and then ask when
capacity estimation is needed. Similar to the observations
we make in this paper, we might expect that in any setting
where the startup phase is a signiﬁcant fraction of the overall
video playback, estimation may be valuable (e.g., for short
videos). However, in all such cases, the burden of proof is on
the algorithm designer to ensure the additional complexity
is necessary.
Acknowledgment
We are grateful to our shepherd Krishna Gummadi and
the anonymous reviewers for their valuable comments and
feedback, which greatly helped improve the ﬁnal version.
The authors would also like to thank Yiannis Yiakoumis,
Greg Wallace-Freedman, Kevin Morris, Wei Wei, Siqi Chen,
Daniel Ellis, Alex Gutarin and many other colleagues in both
Stanford and Netﬂix for helpful discussions that shaped the
paper. This work was supported by Google U.S./Canada
PhD Student Fellowship and the National Science Founda-
tion under grants CNS-0832820, CNS-0904609, and CNS-
1040593.
10.
REFERENCES
[1] S. Akhshabi, L. Anantakrishnan, C. Dovrolis, and
A. Begen. What Happens When HTTP Adaptive
Streaming Players Compete for Bandwidth? In ACM
NOSSDAV, June 2012.
[2] S. Akhshabi, C. Dovrolis, and A. Begen. An
Experimental Evaluation of Rate Adaptation
Algorithms in Adaptive Streaming over HTTP. In
ACM MMSys, 2011.
[3] A. Balachandran, V. Sekar, A. Akella, and S. Seshan.
Analyzing the Potential Beneﬁts of CDN
Augmentation Strategies for Internet Video
Workloads. In ACM IMC, October 2013.
[4] A. Balachandran, V. Sekar, A. Akella, S. Seshan,
I. Stoica, and H. Zhang. Developing a Predictive
Model of Quality of Experience for Internet Video. In
ACM SIGCOMM, August 2013.
[5] L. D. Cicco, V. Caldaralo, V. Palmisano, and
S. Mascolo. ELASTIC: a Client-side Controller for
Dynamic Adaptive Streaming over HTTP (DASH). In
IEEE Packet Video Workshop, December 2013.
[6] L. D. Cicco and S. Mascolo. An Experimental
Investigation of the Akamai Adaptive Video
Streaming. In USAB, November 2010.
[7] F. Dobrian, A. Awan, D. Joseph, A. Ganjam, J. Zhan,
V. Sekar, I. Stoica, and H. Zhang. Understanding the
Impact of Video Quality on User Engagement. In
ACM SIGCOMM, August 2011.
[8] T.-Y. Huang. A Buﬀer-Based Approach to Video Rate
Adaptation. PhD thesis, CS Department, Stanford
University, June 2014.
[9] T.-Y. Huang, N. Handigol, B. Heller, N. McKeown,
and R. Johari. Confused, Timid, and Unstable:
Picking a Video Streaming Rate is Hard. In ACM
IMC, November 2012.
[10] J. Jiang, V. Sekar, and H. Zhang. Improving fairness,
eﬃciency, and stability in http-based adaptive video
streaming with festive. In ACM CoNEXT, 2012.
[11] S. S. Krishnan and R. K. Sitaraman. Video Stream
Quality Impacts Viewer Behavior: Inferring Causality
Using Quasi-Experimental Designs. In ACM IMC,
November 2012.
[12] Z. Li, X. Zhu, J. Gahm, R. Pan, H. Hu, A. C. Begen,
and D. Oran. Probe and adapt: Rate adaptation for
http video streaming at scale. In
http: // arxiv. org/ pdf/ 1305. 0510 .
[13] X. Liu, F. Dobrian, H. Milner, J. Jiang, V. Sekar,
I. Stoica, and H. Zhang. A Case for a Coordinated
Internet Video Control Plane. In ACM SIGCOMM,
August 2012.
[14] Y. Liu, S. Dey, D. Gillies, F. Ulupinar, and M. Luby.
User Experience Modeling for DASH Video. In IEEE
Packet Video Workshop, December 2013.
[15] R. Mok, X. Luo, E. Chan, and R. Chang. QDASH: a
QoE-aware DASH system. In ACM MMSys, 2012.
[16] Sandvine: Global Internet Phenomena Report 2012
Q2. http://tinyurl.com/nyqyarq.
[17] Sandvine: Global Internet Phenomena Report 2013
H2. http://tinyurl.com/nt5k5qw.
[18] Netﬂix ISP Speed Index.
http://ispspeedindex.netflix.com/.
[19] H. Sundaram, W.-C. Feng, and N. Sebe. Flicker
Eﬀects in Adaptive Video Streaming to Handheld
Devices. In ACM MM, November 2011.
[20] G. Tian and Y. Liu. Towards Agile and Smooth Video
Adaptation in Dynamic HTTP Streaming. In ACM
CoNEXT, December 2012.
[21] Private conversation with YouTube ABR team.


