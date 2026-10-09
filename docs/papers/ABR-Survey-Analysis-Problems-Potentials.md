# ABR-Survey-Analysis-Problems-Potentials

- **Source file:** ABR-Survey-Analysis-Problems-Potentials.pdf
- **Pages:** 9
- **Author(s):** Deepankar Singla
- **Creation date:** D:20191206031216+00'00'

---

<!-- page 1 -->

Adaptive Bitrate Streaming:  
Analysis, Problems and Potentials 
 
Depankar Singla (12026105) 
 
 
 
 
Sumit Agarwal (12680648)
 
 
I NTRODUCTION
 
In 
the recent times
, online video streaming has overtaken the ofline video. 
Many video
 
streaming 
services
 (Netflix, YouTube, etc.) are providing briliant experience to their users. In 
order to do that, there are several methodologies adapted by these big industry players.
 
Mainly the optimizations revolve around using Adaptive Bitrate Streaming in the HTP based 
video streaming services. Our main focus area wil be to analyse 
the actual data transfer rates 
and the
 latency
 of 
these
 streaming aplications, along with the efec
ts of network trafic 
congestion on these aplications
. 
 
R EQUIREMENTS
 O
F ABR 
A LGORITHM
 
° 
High Bitrate
 : Should play the video at the highest sustainable quality (i.e., bitrate).
 
° 
Low Rebufering
 : Should avoid rebufering events (i.e. frezes) that ocur due to the 
client bufer being empty.
 
° 
Low Oscilations
 : Should avoid excesive bitrate oscilations where the video quality 
is frequently modified during the playback.
 
° 
Responsivenes to Network 
Events
 : Should react quickly to network events. For 
instance, if the network throughput sudenly drops, the ABR algorithm should 
decrease the video bitrate to adjust to the new network state.
 
° 
Responsivenes to User Events
 : Should react quickly to user ev
ents.
 
 
Q
O E (Quality of Experience)
 
Given the 
variations of parameters on which the video streaming QoE(Quality of Experience) 
depends, such as 
network environments, device capabilities, and content properties
 in a 
comercial seting, 
perfecting
 ABR 
is a herculean task. For 
Optimal QoE
, the calculations for
 
finding the optimal bitrate selections
 can be done only having 
ful knowledge of the entire 
network throughput trace.
 This implies that
 the optimal QoE is 
de
pendent on ABR.



<!-- page 2 -->

Q o E
 
 Fig. 1
 - Factors afecting QoE
 
 
 
 
P ACKET
 A NALYSIS
 
Our initial analysis started from capturing low layer TCP packets exchanging b/w client and 
server. Our main objective was to 
co
- related high layer ABR calculation with exchange of 
packets. To achieve this, we captured packet data as mentioned in the below chart. Next we 
try to find rate of packet exchange
 ( R
p ) periodicaly
. What we have found is this rate of packet 
exchange is d
irectly proportional to video bitrate (
V
b ). 
 
R
p ן 6
b 
 
ABR
Variation of 
Network
Network 
Throughput
Encoding 
Recipes



<!-- page 3 -->

Fig. 
2 – Corelation betwen Bitrate and Packet 
 
S ETUP 
 
Bandwidth Limiter : 
Chrome Webpage Inspect utility network functionality to limit network 
sped/bandwidth wherever required on various 
Devices(Laptops) of varying configurations.
 
[ # of high config devices: 
37
, # of medium config devices: 
1
, # of low config devices: 
2 ] 
High config 
- Latest i5/i7 + 8Gb/16Gb RAM + 1080p Scren
 
Medium config 
- Old i5 + 4GB/8GB + 720p Screns
 
Low 
config 
- any i3 + 2GB/4GB + 720p Screns
 
O
BSERVATION
 
Highly varied data, only tok points with coherence and left outliers to make a beter 
understanding
 
1. Device Type 
: 
Devices with 
Medium Configurations (e.g. 720p scren and i5 procesors)
 tend to 
start the video with 480p encoding. On the other hand, 
High config devices ( e.g. 
1080p screns and newer i5/i7 gen procesors)
 started playback from HD encodings 
Packet capturing
•Video Playback
•Limit Bandwidth
•Quality variations (ABR)
Analysis
•# of flows
•Iterate through each flow
•Calculate # of packets/unit time (X)
Observation
•Calculate delta of X
•If delta change 
- > encoding change
•Delta +
ve
- > quality increase
•Delta 
–ve
- > quality decrease
•Delta no change 
- >no quality



<!-- page 4 -->

(720/1080p). In former case, the ABR algorithm adjusts the quality in a span of few 
seconds
.  
 
 
 
 
 
 
 
 
 
Fig
3 Distribution of 
Device
s 
 
 
 
 
 
 
 
 
 
Fig4 ABR vs Device Type
 
2. Starting Bandwidth 
- 10 Mbps
 
Limiting the bandwidth of the network to test the spontaneity of the ABR algorithm. 
Videos played on various streaming services such as YouTube, Netflix, Amazon Prime, 
HBO, Hulu, Hot
S tar etc. Considered average times acros streaming services.



<!-- page 5 -->

Fig
 5 ABR v
s Network Bandwidth Start 10Mbps
 
 
3. Starting Bandwidth 
- 1 Mbps
 
 
Fig
 6 ABR v
s Network Bandwidth Start 1 Mbps



<!-- page 6 -->

4. Responsivenes to User Events : 
 
Click at future video frames
. Subsequent frames except first one use cached ABR
. 
 
Fig
 7 ABR v
s User Events
 
A BSTRACT
 V IEW
 O
F ABR: 
 
Based on our study, observation and research, the high level view of ABR algorithm is 
presented in Fig 8
 
 
Fig
 8 Abstract View of ABR
 
•Request Server 
- Manifest 
File 
–Available encoding
•Network Throughput
•Device Configuration
Input
•Initialy download lower 
bitrate encoding 
(Conservative) for period P
•At time P
- Δ, run actual 
algorithm.
Proces
•Send request 
- apropriate 
bitrate encoding 
–for 
subsequent period (P
Output



<!-- page 7 -->

N
ETFLIX
 - H
INDSIGHT
 - O
PTIMAL
 ABR
 
To
 identify shortcomings efectively at a large scale, a scalable methodology is neded 
to evaluate ABR algorithms under various 
changing parameters that difer widely over 
quite a range.
 However,
 optimal
 ABR is an NP
- hard problem and
 therefore is 
costly to 
be deployed
 at a comercial scale
. NETFLIX has developed 
its
 own ABS algorithm 
named HINDISGHT to know which encoding to download at the client side. The 
original algorithm behind the decision is an NP
- Hard problem which HINDSIGHT tries 
to solve 
using the 
Subset
 Sum problem technique or using the Gredy algorithm to 
make the calculations scalable.
 
 
 
Fig 8 : 
Image Source : Hindsight (Netflix)
 
 
E XTRA 
W
ORK
 : Y OUTUBE VS 
N
ETFLIX
 
° 
Netflix 
- starts with a lower
- bitrate stream 
- > slowly scales up
 
° 
YouTube 
- majority videos only last a minute or two. 
- > more agresive in sending 
out higher
- quality video then scales down the video if necesary
 
° 
Netflix 
- not starting video playback for very low bandwidth
 
° 
Asumption : YouTube uses UDP/QUIC which is 
designed so that if a client has talked 
to a given server before, it can start sending data without any round trips, which 
makes web pages load faster.
 
° 
Netflix 
- not starting
 with low bandwidth as lower quality encodings might not be 
available for US users
 as oposed to other countries.
 
° 
Netflix 
- it does 
not load any frame
 for lower bandwidths
 - want to give maybe 
seamles experience to user
.



<!-- page 8 -->

Fig 8 : 
Netflix
 vs YouTube data points
 
 
 
OUTCOMES : 
 
• 
Device dependent ABR
. 
• 
ABR caches the network variations and use retrospective information for future 
decisions to enhance QoE
 
• 
If higher bandwidth not sen earlier by ABR, it wil not switch to HD content even 
though it can. 
 
 
F UTURE 
W
ORK
 
° 
ABR performance on various devices (e.g. 
– Mobile,Tablets, etc.) 
– Celular Network 
variation more.
 
° 
Low
- Latency Live Streaming
 - Should perform wel when streaming live videos that 
requires low latency, where latency is the maximum time betwen when the vi
deo is 
captured and when the user ses it. A key chalenge is that since latency must be low, 
the client bufer is necesarily smal and can hold no more than a few segments. Thus, 
video segments canot be fetched by the client wel in advance of when they
 are 
played out. A smal bufer leaves litle rom for eror as a single suboptimal ABR 
decision could result in draining the bufer, resulting in rebufering



<!-- page 9 -->

R EFERENCES:
 
1. Gogle I/O 2013 
- Adaptive Streaming for You and YouTube
 
“htps:/developers.gogle.com/events/io/2013/sesions
” 
2. Huang, Te
- Yuan, et al. "Hindsight: evaluate video bitrate adaptation at scale." 
Procedings of the 10th ACM Multimedia Systems Confer
ence. ACM, 2019.
 
3. htps:/en.wikipedia.org/wiki/Adaptive_bitrate_streaming
 
4. htps:/research.netflix.com/busines
- ar
ea/streaming
 
5. htps:/youtube
- eng.gogleblog.com/2018/04/making
- high
- quality
- video
-
eficient.html
 
6. 
htps:/drive.gogle.com/file/d/0ByAGuq_cEMQFdjBVcmtPU9iNzJM0FRWV9MTmNXR2s
0TWNB/view
 
7. 
htps:/research.netflix.com/busines
- area/streaming
 
8. 
htps:/w.akamai.com/us/en/multimedia/documents/te
chnical
- publication/improving
-
bitrate
- adaptation
- in - the
- dash
- reference
- player.pdf


