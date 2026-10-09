# Netflix-Open-Connect-Briefing-Paper

- **Source file:** Netflix-Open-Connect-Briefing-Paper.pdf
- **Pages:** 42
- **Creation date:** D:20210825162403+01'00'

---

<!-- page 1 -->

01
A cooperative approach  
to content delivery



<!-- page 2 -->

We would like to thank Robert Kenny of Communications 
Chambers for providing helpful comments on this briefing paper.
Cover illustration by Bratislav Milenkovic.
A cooperative approach  
to content delivery
A Netflix briefing paper  
2021



<!-- page 3 -->

A Netflix briefing paper
2021
3
A cooperative approach  
to content delivery
Online work, school, and entertainment have 
long been complements to their physical 
counterparts. But with no other option, basic 
needs were met for many of us with these not 
always perfect replacements. The pandemic 
highlighted how robust online alternatives can 
be, as many quickly scaled to meet the demand 
for interpersonal connection. Internet networks 
had to adapt to meet the growing demand for 
high speed broadband, by leveraging their 
existing capacity for a massively increased load.
The increased demands during the pandemic 
highlight the importance of cooperation. 
Together, content providers and networks have 
been meeting people’s needs. Without both, our 
ability to sustain human connection, distanced 
productivity, or continuous learning is challenged. 
Both must be fostered in a sustainable way.
We saw examples of this cooperation in its 
finest form during the pandemic. Where the 
exceptional nature of the pandemic made it 
Foreword
When the COVID-19 pandemic forced us to recede into a 
global quarantine, the ways in which many of us connect with 
each other - through work, school, and entertainment - ceased 
in their typical forms. Where possible, we moved the essential 
functions of society online using our internet connections.
necessary, Netflix and other video streaming 
services reduced the bandwidth of streams to 
decrease traffic volume, and ISPs around the 
world quickly grew capacity to ensure continued 
connectivity for internet users. To get content 
to consumers more efficiently, Netflix and ISPs 
worked together to deploy additional servers into 
ISPs’ networks as well as increase capacity in our 
backbone network and at local internet exchange 
sites in order to fulfill the growing demands for 
Netflix content.
An internet that can meet the needs of 
a globally connected population - during a 
pandemic and beyond - depends on such 
cooperation between ISPs and content providers 
to best provide the services they offer to  
their customers. 
Humanity will move beyond the pandemic.  
But we should take the lessons we have learned 
about the need for a collaborative approach to 
online content delivery forward long into the future.
Gina Haspilaire
Vice-President, Content Delivery
Netflix



<!-- page 4 -->

3
27
Threats to the ecosystem:
Understanding traffic charges
1
2
5
8
36
37
38
15
Executive summary
Content & network:  
The need for cooperation
Conclusion
Glossary of terms
Appendix:  
Transit and peering
Cooperation in practice:
Netflix Open Connect
Contents



<!-- page 5 -->

A Netflix briefing paper
2021
5
A cooperative approach  
to content delivery
Consumers buy internet access from ISPs in order to reach 
content and applications. Without content, consumers 
would have less need for internet access. Likewise, without a 
connected population, content providers would have no ability 
to service consumer requests. Put simply, online services and 
internet networks depend upon each other. 
Executive 
summary
This complementary relationship between 
content providers and networks has resulted in a 
model of content delivery based on cooperation 
- a model which has promoted a virtuous circle 
of innovation, whereby the improvements in 
networks inspire new forms of content, and this 
in turn drives uptake of higher speed broadband 
plans. This model has also encouraged greater 
connectivity and the wider societal benefits that 
occur when consumers and businesses have 
improved access to information and services. 
However, despite its strengths, there have been 
threats to this model. In some countries, proposals 
have been made that could place a tollbooth in 
front of the entrance to networks, blocking traffic 
requested by consumers unless content providers 
agree to pay to lift the gate. These proposals have 
often been a response to the myth that content 
and application providers do not contribute to the 
costs associated with building out connectivity, 
leaving ISPs unable to upgrade and expand 
broadband networks. 
Against this backdrop, this report demonstrates 
that Netflix and other content providers are 
investing significantly in content delivery 
infrastructure and video streaming technology  
to deliver content more efficiently. Further, it 
shows that an approach built on cooperation, 
rather than traffic charges imposed on content 
providers by ISPs, is good for ISPs, content 
providers, consumers, and society as a whole. 
Chapter one of the report explores the 
complementary relationship between ISPs 
and content providers and shows how this 
relationship generates significant benefits 
for both. For content providers, largely 
frictionless connectivity to a huge user base



<!-- page 6 -->

A Netflix briefing paper
2021
6
A cooperative approach  
to content delivery
has underpinned the uptake and usage of those 
services. For networks, consumers purchase 
internet access to reach such services. 
Online entertainment services like Netflix 
invest significantly in content to engage and 
delight their customers. Netflix alone spent more 
than $12.5B on content in 2020. Reaching 
such content is a substantial portion of what 
consumers do with their internet connection and 
may prompt them to upgrade their broadband 
connection, generating incremental revenue 
for ISPs. Empirical evidence suggests that 
broadband customers who use Netflix are more 
likely to be on higher speed (and more expensive) 
broadband connections. For example, a study 
of broadband users in Italy in 2017 found that of 
those on ADSL (Asymmetric Digital Subscriber 
Line) connections, 12% were Netflix users, while 
for those with FTTH (Fiber To The Home), 18% 
were. In the UK, 77% of those with standard 
broadband were users of subscription video-on-
demand services (such as Netflix), compared 
to 86% and 90% respectively of those with 
superfast broadband and ultrafast broadband.1 
In markets where broadband adoption has 
not reached saturation, online services can 
encourage broadband deployment and uptake. 
In addition, in markets where fixed broadband 
adoption is high, video traffic is a key reason for 
customers to retain a fixed internet connection 
rather than going mobile-only. 
This complementary relationship incentivizes 
ISPs and content providers to work together 
to focus on the best technical approach for 
consumers and this, in turn, generates value  
for ISPs, content providers and consumers. 
Chapter two of the report explains how Netflix 
efficiently delivers its content. Netflix’s Open 
Connect Content Delivery Network (CDN) moves 
content closer to consumers using a distributed 
network of local servers at the edge of, or within, 
an ISP’s network.
This benefits ISPs by reducing the distance 
they must go to fetch traffic, and thus their costs. 
For our ISP partners that have opted to deploy 
servers within their own networks, this cost 
saving is estimated to be $1.2B in 2020.
Moving content closer also frees up long 
haul network infrastructure for the other types 
of traffic for which those links are essential - for 
example, live video streaming or voice calls over 
the internet which cannot be stored locally.  
This can reduce congestion, resulting in a  
higher quality service for consumers. 
Netflix also invests in improving encoding  
and video compression to deliver high quality 
content without using unnecessary bandwidth. 
As a result, the number of hours a Netflix 
member can stream per GB of data has increased 
by more than 200%2 over the last five years. 
Ofcom, Technology Tracker 2021, 17 December 2020. 
Standard broadband is defined as providing a download 
speed of less than 30 Mbps, superfast broadband between 
30 Mbps and 300 Mbps and ultrafast broadband more than 
300 Mbps. 
Based on the latest encoding profile.
1
2
$1.2B
200%
on estimated savings for our ISP 
partners that have opted to deploy 
servers within their own networks
increase in the number of 
hours a Netflix member can 
stream over the last five years



<!-- page 7 -->

A Netflix briefing paper
2021
7
A cooperative approach  
to content delivery
Chapter three concludes with an assessment  
of why traffic charges imposed on content 
providers by ISPs will be harmful to consumers.  
It considers the key arguments cited by those 
who support traffic charges: that ISPs need funds 
from content providers for investment and that 
content providers do not contribute to the costs 
of delivering content.
It also discusses the main risks associated 
with traffic charges. 
Traffic charges pose problems because 
there are no alternative routes to the end user. 
A consumer’s chosen ISP has complete control 
over what content can travel over the connection. 
This creates a ‘terminating access monopoly’ 
which can pose multiple risks when combined 
with traffic charges.
Traffic charges can lead to double-charging 
where ISPs seek to charge content providers for 
the carriage of traffic that their customers have 
already paid for. Customers pay for an internet 
connection on the understanding that it will allow 
them to reach all content available on the entire 
internet, not just from those content providers 
who have agreed to their ISP’s traffic fees. The 
problem of double charging is exacerbated when 
the speeds required for the content being delivered 
are well under the speeds paid for by consumers.
Traffic charges may also allow ISPs to leverage 
their own video offers. Many ISPs compete 
directly with streaming video services, either 
because they are themselves a cable TV operator, 
or a telco with an IPTV offering. Any degradation 
of quality for other video providers strengthens the 
competitive position of an ISP’s own TV service, 
disturbing a level playing field.
Traffic charges can lead to perverse 
incentives. The only way for an ISP to force a 
content provider to pay for traffic charges is 
to ensure congestion otherwise limits an ISP’s 
customers from receiving requested traffic from 
the content provider. This congestion represents 
powerful leverage for the ISP to force the content 
provider to accept the demanded cost to connect 
directly, and thus the ISP has little incentive to 
remedy the congestion. 
Furthermore, allowing payments may 
discourage content providers from investing  
in moving content closer to consumers,  
to the detriment of ISPs and consumers alike. 
There is no requirement to move content closer 
to consumers. An uncongested long haul 
connection can still deliver high quality video.  
If an ISP imposes charges, the content provider 
may choose to deliver their traffic from  
a jurisdiction where payments are not required. 
For the ISP, this will likely mean that it is now 
paying to receive the traffic, since it may need  
to invest in international capacity to carry it back 
to their consumers from that jurisdiction. 
Consumers invariably lose in this situation. 
They will be exposed to the risk of congestion 
along the path to more remote content, with 
possible degradation of their user experience. 
There is also a risk that consumers will lose 
access to the plurality of voices and applications 
that have enabled the internet to thrive.
Thus traffic charges are a backward step, 
with the potential to disrupt a highly productive 
partnership between ISPs and content providers 
that has been the bedrock of the internet’s 
success to date.
Looking ahead, a cooperative model will only 
be sustained under two conditions. Firstly if 
content providers and ISPs continue to recognize 
the complementary nature of networks and 
content. Secondly, if governments acknowledge 
the important role that content providers play in 
stimulating demand for broadband services and 
establish supporting policy frameworks which 
restrict the imposition of charges by ISPs on 
content providers.



<!-- page 8 -->

A Netflix briefing paper
2021
8
A cooperative approach  
to content delivery
Content 
& network
1
The need  
for cooperation
The complementary nature  
of content and networks
Investments in video create  
demand for connectivity
Efficiency benefits  
of a cooperative model
9
11
14



<!-- page 9 -->

A Netflix briefing paper
2021
9
A cooperative approach  
to content delivery
The complementary nature  
of content and networks
The very essence of the internet is that it is a 
‘network of networks’ - not a monolithic single 
network, but many separate interconnected 
networks of completely different types.  
The internet, for the most part,3 has allowed 
anyone online to communicate with anyone else 
online. This flexibility has been transformative. 
A consumer who purchases internet access 
can reach nearly any type of content from nearly 
any public network, anywhere around the world. 
Consumers can access a plethora of information 
and services and ultimately choose which 
businesses are successful. As of 2020, there  
were 4.7B people online.4 There are 192M  
active websites globally,5 and 3M apps available  
in the Google Play store.6 
For content providers, largely frictionless 
connectivity to a huge user base has created 
incentives for investment in applications, and 
underpinned the uptake and usage of those 
applications.7 This in turn has led to an explosion 
of innovation and competition. 
For networks, consumers purchase internet 
access to reach such content and applications. 
And as those applications become more advanced, 
demand for bandwidth has grown. The networks 
have found great value in providing access to 
information, entertainment, and each other. 
The relationship between content providers 
and networks is complementary and the 
complementary relationship between ISPs and 
providers of video content is particularly strong. 
Services like Netflix rely on networks to distribute 
content to consumers and ISPs benefit from 
increased demand for connectivity.
For example, some governments block access to certain 
sites in other countries, and many ISPs block illegal content.
Statistica, Worldwide Population as of October 2020, 
Statistica 2021.
Netcraft, September 2020 Web Server Survey,  
23 September 2020.
AppBrain, Number of Android apps on Google Play,  
14 October 2020.
See, for instance, Plum, The open internet – a platform for 
growth, 2011; TRPC, Fostering an Open Internet in Asia, 
January 2017.
3
4
5
6
7



<!-- page 10 -->

A Netflix briefing paper
2021
10
A cooperative approach  
to content delivery
12.5
$
B
spent on content in 
2020, driving demand 
for high speed internet 
connections



<!-- page 11 -->

A Netflix briefing paper
2021
11
A cooperative approach  
to content delivery
Streaming entertainment - which is often 
on-demand, personalized, and available on 
any screen - is expanding rapidly. Consumers 
appreciate the freedom, flexibility, and rapid 
innovation streaming entertainment services 
afford. Access to high speed and reliable internet 
and internet connected devices have enabled 
these streaming services to become popular. 
Watching video is now a substantial portion 
of what many consumers do with their high 
speed broadband connection. Video streaming 
represents 58% of traffic. (YouTube is 16 
percentage points of this, and Netflix 11 points).8 
This high level of usage is only brought about 
because of substantial investments in content 
that consumers want to watch.
Investment in video content
Netflix is one of the world’s leading entertainment 
services. The strength of our global content offer 
is fundamental to our success. Great content 
grows engagement among our members, which 
we believe drives word-of-mouth, improves 
retention and grows memberships. In 2020,  
we spent over $12.5B9 on streamed content.  
We invested in both Netflix originals and  
second-run movies and TV shows across 
many different genres (scripted series, films, 
documentaries, comedy, unscripted TV, kids  
and family, anime, etc). These movies and TV 
shows come from producers all around the world, 
and their stories are shared with the world. 
Historically, television has been bound by a 
linear program schedule and often a reliance on 
advertising, which put a premium on airing content 
that will appeal to the widest audience during 
times likely to attract the most viewers. But online 
business models, such as Netflix’s, depend on 
consumers consistently finding exciting content 
to watch, not just at prime time, but whenever the 
consumer wants. This gives streaming service 
customers the opportunity to discover new 
content and enables streaming services to make 
significant investments in innovative programming 
from creators that historically may have had 
difficulty reaching a global audience.
Netflix is not the only company investing in 
video content. Unlike traditional broadcasters, 
which were reliant on exclusive access to 
spectrum or dedicated cables, streaming 
services are able to offer their service via an 
internet connection. These lower barriers to 
entry for content delivery mean that diverse and 
competitive players can offer innovative and 
compelling content. We, like other major providers 
of online entertainment services, are all operating 
in a dynamic and thriving sector where a wide 
range of players are incentivized to continually 
innovate and invest in their services and the 
audiovisual ecosystem in order to win consumer 
attention. Many other major entertainment 
Investments in video create 
demand for connectivity
Sandvine, The Global Internet Phenomena Report, May 
2020. Note that these figures relate to a period when many 
were at home due to COVID-19. However, figures for total 
streaming and for Netflix were broadly similar in 2019, 
though YouTube was lower (9%).
See Netflix 2020 Quarterly Earnings Fourth Quarter 
Earnings, Financial Statements. Cash spending on content 
can be derived from the cash flow statement. The sum of 
Additions to Streaming Content Assets and the Change in 
Streaming Content Liabilities equates to cash spending on 
streaming content.
8
9



<!-- page 12 -->

A Netflix briefing paper
2021
12
A cooperative approach  
to content delivery
companies like Disney and NBCUniversal are 
investing in their own streaming services, as 
are Amazon and Apple, in order to compete 
with providers of user generated content, video 
games, and other online services for a share of 
consumers’ time and spending. 
Creating demand  
for faster broadband 
Video - and in particular higher definition 
video - prompts consumers to upgrade their 
broadband connection, generating incremental 
revenue for ISPs. The FTTH Council, for 
instance, has seen video growth as a driver of 
fibre to the home (FTTH) adoption.10 Ofcom, 
the UK’s communications regulator, has found 
that: The main drivers of residential demand 
for higher speeds have been an increase in the 
use of video-on-demand and gaming, and the 
simultaneous use in a home of multiple devices.11
A report for BEREC (the association of 
European regulators) made a direct link to 
revenue: Content developers and providers 
of Over The Top (OTT) services such as the 
various third-party video streaming services ... 
are important [in] driving increased demand for 
bandwidth but are not typically directly involved 
in the delivery of that bandwidth, but ... could 
certainly influence the operators’ ARPU.12
And operators quite explicitly use video 
streaming to persuade customers to take  
higher speed plans, as the examples on  
the next page show.
There is empirical evidence that broadband 
customers who use Netflix, for example, are more 
likely to be on higher speed (more expensive) 
connections. A study of broadband users in 
Italy in 2017 found that of those on ADSL 
connections, 12% were Netflix users, while for 
those with FTTH, 18% were13. (Note that there 
was no material difference between ADSL and 
FTTH usage rates for YouTube, suggesting 
that it is not simply streaming video that drives 
purchase of higher speed connections, but rather 
HD and UHD video like that provided by Netflix). 
In the UK, 77% of those with standard broadband 
were users of subscription video-on-demand 
services (such as Netflix), compared to 86%  
and 90% respectively of those with superfast  
and ultrafast broadband.14
Thus video on demand, in common with other 
forms of entertainment (such as gaming and 
streaming live sports) is a key driver of demand 
for higher speed broadband.
Encouraging broadband uptake  
and broadband deployment
In markets where broadband adoption has not 
reached saturation, video streaming services 
can help to encourage uptake, with benefits 
to domestic users (who can now interact 
with the new users) and to businesses (who 
can implement new processes). According 
to the Commonwealth Telecommunications 
Organisation: OTT applications stimulate 
broadband adoption and thus economic  
growth and tax receipts.15
IDATE for FTTH, FTTH Forecast for EUROPE, March 2019.
Ofcom, Promoting competition and investment in fibre 
networks: Wholesale Fixed Telecoms Market Review 2021-
26. Volume 2: Market assessment, 8 January 2020
Decision Analysis, SPC Network, Strategy Dynamics & 
Greenwood Strategic Advisors for BEREC, Study on the 
determinants of investment in VHCN – a System Dynamics 
approach. Volume 1: Technical Report, November 2019
Those using Netflix at least once per week. Trevisan, Martino 
et al., Five years at the edge: watching internet from the ISP 
network, April 2020.
Ofcom, Technology Tracker 2021, 17 December 2020. 
Survey participants were asked which of these fixed 
broadband services does your household have: standard 
broadband (download speed of less than 30 Mbps); 
superfast broadband (download speed is 30 Mbps or 
higher and less than 300 Mbps); ultrafast broad broadband 
(download speed is 300 Mbps or higher).
CTO, Over The Top (OTT) Applications & the Internet Value 
Chain, 22 May 2020.
10
11
12
13
14
15



<!-- page 13 -->

A Netflix briefing paper
2021
13
A cooperative approach  
to content delivery
ISPs using streaming as a prompt to upgrade to higher speeds16
50 Mbps
75 Mbps
25 Mbps
100 Mbps
Standard Plus Evening Speed
Superfast Unlimited
Superfast Unlimited
Maxis Fibre
RECOMMENDED FOR:
•  5-7 people streaming in HD
•  Responsive online gaming
RECOMMENDED FOR:
•  Ideal for homes where 
streaming the latest Netflix 
series is the perfect night in
RECOMMENDED FOR:
•  Streaming on multiple devices
•  Sharing videos and photos
•  Online gaming
RECOMMENDED FOR:
•  Full HD streaming & browsing
•  2-3 users on up to 5 devices
•  Double storey or condominium
30 Mbps
30 Mbps
18 Mbps
25 Mbps
Maxis Fibre
Standard Fibre Unlimited
Standard Fibre Unlimited
Standard Evening Speed
RECOMMENDED FOR:
•  Light browsing & streaming video
•  Single user on up to 2 devices
•  Single storey or condominium
RECOMMENDED FOR:
•  For doing all that you love  
online without any data worries
RECOMMENDED FOR:
•  HD video streaming
•  Sharing videos and photos
•  Online gaming
RECOMMENDED FOR:
•  1-3 people browsing
•  Streaming in SD
•  Online gaming
ISP websites [accessed 20 October 2020]. This is a brief summary of broadband 
packages offered by third parties and not a detailed breakdown.
16



<!-- page 14 -->

A Netflix briefing paper
2021
14
A cooperative approach  
to content delivery
The ITU has reported that: Demand for OTTs 
results in both new subscribers for broadband 
services and existing subscribers upgrading their 
subscriptions for greater speed and bandwidth.17
In addition, in markets where fixed broadband 
adoption is high, video traffic is a key reason for 
customers to retain a fixed internet connection 
rather than going mobile-only.
Increased uptake of broadband, and higher 
speed broadband in particular, is clearly good for 
ISPs but it also has spillover benefits to society 
as a whole. Many governments have invested 
substantially to improve the availability of 
broadband, believing in its economic and social 
benefits. But by itself, availability has no value - it 
is consumer uptake that matters. If online content 
providers drive uptake of beneficial broadband, 
then that helps realise the value of governments’ 
investment in availability.
This complementary relationship incentivizes 
ISPs and content providers to work together 
to focus on the best technical approach for 
consumers and this, in turn, generates value  
for ISPs, content providers and consumers.  
In addition, capabilities of the network inspire 
new forms of content, which in turn encourage 
uptake of faster and more robust broadband. 
Video, for example, is a key reason for users to 
upgrade their fixed broadband speed or take 
fixed broadband in the first place. 
In the vast majority of cases, this virtuous 
circle results in a cooperative model of 
deployment where content providers and 
networks work hand-in-hand to deliver content 
more efficiently, reducing costs for both parties. 
As we discuss in the next section, Netflix invests 
substantially to deliver its traffic in such a way as 
to make it easier for ISPs.
Efficiency benefits  
of a cooperative model
This cooperative model works best  
when neither side seeks to charge the other.  
For instance, Netflix (like many other online 
content providers) does not try to charge ISPs.
Similarly, the vast majority of ISPs around the 
world do not charge content providers for delivery 
of their traffic, though as discussed in Chapter 3,  
a few wish to change this.
Today’s approach is the result of decades of 
thoughtful development by content providers 
and ISPs. It is also an approach that ultimately 
provides benefits for consumers.
We now turn to a description of how Netflix 
(and others) deliver their content.
International Telecommunication Union, Economic 
impact of OTTs on national telecommunication/ICT 
markets, 15 June 2020.
17



<!-- page 15 -->

A Netflix briefing paper
2021
15
A cooperative approach  
to content delivery
Cooperation 
in practice
2
Netflix  
Open Connect
Moving content closer
Description of Netflix Open Connect
Benefits for ISPs from Open Connect
Encoding
16
20
23
25



<!-- page 16 -->

A Netflix briefing paper
2021
16
A cooperative approach  
to content delivery
In the early days of the internet, content would 
typically sit on a single server, and then travel 
over multiple networks to reach consumers. ISPs 
either had to build out significant infrastructure 
to reach the content, or else they relied on 
arrangements to enable the exchange of traffic 
across different networks. 
Two types of arrangements evolved. 
The first type is transit, a paid connection 
through a network to the parts of the internet  
not available via a direct connection. Like  
internet access purchased by end users, a  
transit provider can link (directly or indirectly) 
to all other networks on the internet, and their 
associated customers.
The second type is direct interconnection 
whereby two parties connect to one another, 
but only for the purposes of exchanging traffic 
destined for their respective networks (as 
opposed to all of the possible end points on 
the internet that can be provided by transit). 
Interconnection may be settlement-free or 
paid. In settlement-free interconnection, based 
on a mutual benefit, no money is exchanged 
between the parties. This was the basis of all 
interconnection in the early days of the internet, 
and is still the most common arrangement. 
In these cases, there could be vast distances 
between content and the user requesting it. 
Therefore, as the internet grew and became 
more international, some of these arrangements 
became less practical for a number of reasons. 
First, building and maintaining international 
networks is costly, as it involves laying infrastructure 
over long distances - overland and underwater. 
In some cases, this connectivity doesn’t exist 
and would need to be built from scratch. In other 
cases, delivering traffic to a location will require 
passing through multiple networks. 
Moving content closer
90%
$75B
of internet traffic destined for 
consumers is carried by CDNs
is invested annually into infrastructure 
by online service providers to bring 
content closer to consumers



<!-- page 17 -->

A Netflix briefing paper
2021
17
A cooperative approach  
to content delivery
Second, remote content must travel through 
more routers (the internet’s switches) on its 
journey to the consumer. Each one of these 
routers has a chance of being congested by 
high traffic loads, which can lead to packet 
loss18 - the discarding of certain elements of 
the data being transmitted. Packet loss above a 
certain level results in a poor experience for the 
consumer, for example in the form of buffering 
and/or degraded video quality. In extreme cases 
it may render the service unusable.
Third, geographic distance leads to delay 
(latency) in the time it takes a packet of data to 
reach the consumer. This is less of an issue for 
video streaming (where there is less interaction 
and the data flows steadily19 down to the 
consumer). However, it can significantly degrade 
other applications. Loading a web page may 
involve multiple round trips for data between  
the consumer and the server with the content.
The solution to these problems is to move 
a copy of the content in question closer to the 
consumer, using a distributed network of local 
servers, i.e. a Content Delivery Network (CDN). 
This reduces the geographic distance content 
must be carried, shrinking an ISP’s costs. 
CDNs also minimize the number of routers and 
networks content must travel through, minimizing 
opportunities for congestion. 
According to UK regulator Ofcom: The local 
delivery of content can result in better delivery 
times to the consumer, which may translate to 
a better quality of experience, and so is often 
a preferred option for content providers. This 
approach further reduces transit or backhaul 
connectivity costs,20 and can also improve the 
customer experience by reducing the  
likelihood of data congestion in these parts  
of the network.21
Many companies now operate such CDNs. 
Large content providers operate their own  
in-house CDNs. Smaller content providers make 
use of independent CDNs such as Akamai, Fastly 
and Lumen (formerly Level 3). Using a CDN 
provides the ability to quickly and efficiently 
deliver traffic across the internet and is an 
important enabler of market entry and innovation.
CDNs are very widely and heavily used, and 
one study found they carry approximately 90% 
of internet traffic destined for consumers.22 
Analysys Mason estimate that in the period 
2014-17 online service providers invested 
$75bn annually in infrastructure that brings 
content closer to consumers.23 These 
investments reduce costs for ISPs.
Netflix initially relied on independent  
CDNs, but today operates its own CDN,  
called ‘Open Connect’. 
 A data packet is a small unit of data.
Strictly speaking, video is served in chunks, which fill a buffer 
at the user end. As the user watches the video and depletes 
the buffer, a new chunk will be sent. However, this is all 
invisible to the user.
These are costs for the long-haul distribution of traffic,  
which may be borne by an ISP and/or a content provider
Ofcom, Connected Nations 2016, 16 December 2016
Craig Labovitz, Internet Traffic 2009-2019, 26 February 
2019. A range of 60-80% was reported for Brazil in 2018: 
NIC.br, A importância dos Sistemas Autônomos e dos 
Internet Exchanges/PTTs, 23 August 2018. An earlier 
Ofcom study reported 83% of fixed network traffic came 
from CDNs in 2017. Ofcom, Connected Nations 2017  
- Data analysis, 15 December 2017.
Analysys Mason, Infrastructure Investment by online service 
providers, December 2018.
18
19
20
21
22
23



<!-- page 18 -->

Long way round
Data would be forced 
to travel through many 
routers and networks
Lost in transit
Congestion would lead
to ‘packet loss’, causing 
quality to degrade
Traffic jams
Each router could 
be congested by 
high traffic volumes
SINGLE SOURCE
When a user requested 
video content, it was served 
from a single location
CONGESTED DELIVERY
This server may have been a huge 
geographical distance from the user 
and traffic growth would mean 
expanding this long distance capacity
HUGE EXPENSE
Securing global connectivity 
would come at a high cost 
to Internet Service Providers 
(ISPs) who would have to 
purchase or build these 
backhaul connections
A Netflix briefing paper
2021
18
A cooperative approach  
to content delivery
The long haul
Why the early structure of the internet could not scale  
to meet the demands of today’s internet usage



<!-- page 19 -->

A Netflix briefing paper
2021
19
A cooperative approach  
to content delivery
1.2
$
B
The amount of money
Open Connect saved
ISPs in 2020



<!-- page 20 -->

A Netflix briefing paper
2021
20
A cooperative approach  
to content delivery
As of early 2021, Netflix has over 200 million 
paying customers around the world, using tens  
of thousands of combinations of device and 
network configurations. Open Connect is a key 
part of ensuring that these customers can reliably 
access high-quality video streams as efficiently  
as possible. Netflix also uses other techniques,  
such as sophisticated video compression and  
file versioning to reduce the size of video files, 
which we discuss later.
Open Connect CDN is a combination of local 
servers (called Open Connect Appliances - 
OCAs) and backbone infrastructure. Since the 
launch of Open Connect in 2011, Netflix has 
spent over US$1B to develop and deploy over 
14,000 OCAs across 142 countries.
Description of  
Netflix Open Connect
Illustration of Open Connect architecture
Users
Origin
server
Wider internet
OCA content refreshes 
every night
OCAs can sit at IXPs or 
within ISP networks
Broadband
access
ISP
OCA
IXP
OCA



<!-- page 21 -->

A Netflix briefing paper
2021
21
A cooperative approach  
to content delivery
In order to bring content as close as possible 
to the consumer, OCAs are either deployed 
within ISP networks or at public Internet 
Exchange Points (IXPs), physical locations  
where many networks come together to 
exchange traffic. Each OCA deployment stores 
nearly all of the Netflix catalogue, including each 
title in the various formats and video qualities. 
Content is refreshed overnight as new content  
is released or becomes more popular. 
Open Connect will directly interconnect with 
any ISP to hand off traffic at one or multiple IXPs. 
The interconnection predominantly supports 
the flow of traffic from Netflix to the ISP, with 
each side upgrading the capacity as needed 
to support user requests for content. Unlike 
interconnection among ISPs, where traffic is 
exchanged in both directions, traffic is primarily 
content destined for the ISP’s users that have 
requested it, so it is flowing in one direction.
OCAs within an ISP’s network are provided  
by Netflix to the ISP free of charge on a  
non-discriminatory basis. In most cases,  
the ISP takes full ownership and control of the 
equipment. Installing an OCA within the ISP’s 
network allows the ISP to place it wherever in its 
network is most beneficial, avoiding costs that 
might otherwise be incurred fetching content 
over long distances to bring it into its network. 
To date, over 1,000 ISPs have taken ownership 
of and installed OCAs. For our ISP partners that 
have opted to deploy servers within their own 
networks, the cost savings for 2020 is estimated 
to be approximately $1.2B.
If an OCA is hosted at an IXP, then Netflix 
retains ownership and pays for its own power 
consumption, colocation fees, cross-connect 
fees and so on. Netflix has placed OCAs in more 
than 80 IXP locations in over 25 countries,  
where Netflix will peer with any ISP.
This investment by Netflix can have spillover 
benefits when a content provider like Netflix 
builds out its CDN to an IXP, ISPs and other 
content providers may be encouraged to also 
have a presence at that IXP. Multiple content 
providers and ISPs coming together at a single 
IXP location can generate significant efficiencies 
for all concerned.
Cost savings calculation
 
In turn the price per unit of traffic 
depends upon the cost of leasing  
long haul capacity. 
The cost savings estimate reflects 
the savings that ISPs that take OCAs 
within their networks realize as a result 
of significant localization via the Open 
Connect Appliances and the resulting 
reduction in long haul internet backbone 
costs. It is important to note that even 
partners that are unable or unwilling  
to take OCAs within their network still 
realize savings as a result of localization  
of content within IX sites. Without the 
Content Delivery Network (CDN) content 
would be handed off at the source of the 
data (a handful of cloud storage regions) 
and the ISP would then carry the content 
to their end users.
Volume  
of traffic x
x
Distance 
traveled
Price per  
unit of traffic
Estimate of costs per year =



<!-- page 22 -->

25
100
Netflix headquarters
in California, USA
KEY
Netflix OCAs 
Located within public 
Internet Exchange Points
OCAs gifted to Internet 
Exchange Points 
(ISPs)
Number of content 
caches per server
Bringing content closer
Netflix’s investment in a new world of content delivery
OPEN CONNECT
Netflix now stores its content close to every member 
- no matter where in the world they are. 
Open Connect is Netflix’s Content Delivery Network.  
It’s made of more than 14,000 Open Connect  
Appliances (OCAs) spread across 142 countries.
A Netflix briefing paper
2021
Note: Data as of 2020
22
A cooperative approach  
to content delivery



<!-- page 23 -->

A Netflix briefing paper
2021
23
A cooperative approach  
to content delivery
Cost savings
Having content delivered by Open Connect 
provides various cost savings to ISPs. 
First, they avoid ‘transit charges’. While many 
ISPs will freely exchange traffic with other ISPs 
in their own region by directly interconnecting 
with each other,24 to exchange traffic with more 
distant networks they generally rely on (and pay) 
transit providers. Further, they have to ‘meet’ the 
transit provider at an overseas location if transit is 
unavailable in their own country. In this case, the 
ISP will need to pay not only the transit charge, 
but also the costs of expensive international 
backhaul capacity to reach the transit provider.
However, Open Connect allows ISPs to avoid 
these costs, by passing the traffic directly to the 
ISP rather than via a transit link. 
According to TeleGeography: While the 
increase in broadband users and  access rates 
will continue to drive traffic growth in access 
networks, much of this growth may be managed 
locally within a network and may not lead to 
proportional increases in traffic on international 
links. Thus, CDNs and caching will continue to 
have a localizing effect on traffic patterns and 
dampen international internet traffic growth.25
French ISP Altice has noted that embedded 
Open Connect OCAs have: Advantages both 
for the ISP and Netflix, minimizing the Internet 
traffic, while improving the quality experienced 
by customers, respectively.26
Benefits for ISPs  
from Open Connect
Second, if an ISP hosts multiple OCAs, it  
also avoids some cost for their own core network 
capacity. Traffic can be delivered to the consumer 
from a nearby server, rather than having to travel 
across the ISP’s core. UK broadband provider 
Sky has cited CDN caching as a key source of 
cost saving as video demand grows.27
Case study: Brisanet
Brisanet is a regional ISP that operates 
in the Northeast region of Brazil. Netflix 
traffic represents about one fifth of 
Brisanet total traffic. 
Localizing the traffic has helped 
the company to significantly reduce 
transport traffic within Brisanet’s 
network and thus reduces costs for 
augmenting transport capacity.
Localizing traffic has also improved 
the quality of experience for consumers. 
After installing Open Connect servers, 
Brisanet has received very positive 
feedback from their customers via  
their call center.
See the appendix for a more detailed discussion.
TeleGeography, The State of the Network, February 2020.
Altice Labs, InnovAction #2, January 2018.
Sky, Sky Core Network - Positioning for Massive Video 
Demand, 20 Feb 2018.
24
25
26
27



<!-- page 24 -->

A Netflix briefing paper
2021
24
A cooperative approach  
to content delivery
Netflix Open Connect is uniquely able to help 
ISPs take advantage of these benefits because 
we have a defined, limited catalogue of content. 
Netflix is able to better optimize the upload 
content to OCAs during off-peak hours, which 
avoids burdening the ISP or other parts of the 
internet during periods of the day where there is 
the highest usage. This means the connectivity 
needed to fill these servers is often without any 
cost to the ISP, as network capacity is built (or 
acquired) for peak capacity. Netflix is uniquely 
able to pre-position copies of all content in 
advance. Many content providers store a copy 
of a file only after it has been requested by 
a user, which may occur during peak hours. 
Furthermore, because the volume of Netflix 
traffic is limited, an OCA deployment can offload 
up to 100% of traffic from a single location. 
Increased revenue from consumers
Aside from these immediate cost benefits,  
the improved quality of experience for the 
consumer has benefits for ISPs. Consumers who 
are happy with their experience of the services 
they receive over their broadband connection  
are unlikely to change their broadband supplier.  
By preventing buffering and instability, CDNs 
help broadband networks retain their customers.
A survey of broadband users found that slow 
speed/buffering and poor stability were the two 
main reasons that would influence broadband 
consumers to change their supplier.28 
Network operators recognise the quality 
and cost benefits of CDNs. According to UK 
ISP TalkTalk: Caching helps manage capacity, 
customer experience and costs … Netflix, for 
example, is located at over 60 locations around 
the UK, avoiding bandwidth costs in the core 
network and serving content to end customers 
with lower latency response times.29
GSMA, the global association of mobile 
operators, has said: By having content closer 
to the subscribers (using CDNs), the expected 
delays are shorter, and this means better quality 
of experience. Also, by having visibility on the 
services and the locations where those services 
are being used, the operator can spend less 
on network optimisation, prioritising the most 
important areas of high-value services. Users 
with better QoE [Quality of Experience] directly 
translates to less churn.30
In addition to these advantages, CDNs are 
more resilient, since if one element fails, traffic 
can be redirected to other servers, reducing the 
risk of downtime.
Huawei / Strategy Analytics, Unlocking Value for Residential 
Broadband Services with Quality Broadband Network, 
October 2017.
TalkTalk, Capital Markets Day, 5 March 2019.
GSMA, América Móvil and VIAVI Solutions – Creating 
Business Value through Content Delivery and Analytics, 17 
December 2019. Text in brackets added for purposes of 
clarification.
28
29
30
Case study: Telecentro
Telecentro is an ISP in Argentina.  
Thanks to Open Connect, the company 
was able to significantly reduce its costs 
for international transit and improve 
performance. Because of that, their 
customer base grew faster as they 
were perceived as a very high quality 
broadband ISP in the market.



<!-- page 25 -->

A Netflix briefing paper
2021
25
A cooperative approach  
to content delivery
Greater control
Open Connect provides ISPs with unparalleled 
control over how they receive Netflix traffic. 
Video-on-demand traffic has a largely predictable 
daily pattern, rising to a maximum in the evening. 
This allows content providers and ISPs to better 
predict and account for peak traffic. ISPs have full 
control over where they receive traffic, whether 
at one of the many IXP locations where Netflix is 
present or through placement of OCAs within  
their network. ISPs can fully determine which 
of their customers are served from which OCA, 
enabling better network planning and resilience. 
ISPs are also able to determine when the 
content on OCAs is refreshed with the latest 
Netflix films and series. This allows them to 
ensure content is refreshed at off-peak times,  
so it does not contribute to peak capacity needs. 
This can help to minimize costs and provide 
greater network stability.
Encoding
Open Connect is not the only tool Netflix uses  
to ensure a good user experience. It also seeks  
to use the least amount of data to deliver a  
given picture quality.
Delivering quality video to Netflix’s members 
without using unnecessary bandwidth allows 
a good experience even on intermittent 
connections or those with limited bandwidth. 
But efficient encoding is applied to all Netflix’s 
streams, and this has a benefit for ISPs too,  
since it minimises the traffic flowing across  
their networks.
There are also benefits to members beyond 
just picture quality. If less of a household’s 
broadband capacity or wifi capacity is used for  
a given Netflix stream, then the freed capacity 
can instead be used for other applications.
There are two aspects to creating more 
efficient video streams. The first is that Netflix 
encodes multiple versions of the same video 
file, customised to the capabilities of different 
devices (including legacy ones) and the available 
bandwidth on a member’s internet connection. 
The multiple encoding versions adapt to the 
device and available bandwidth automatically, 
allowing the resolution to go up depending on 
what a device is capable of and/or congestion 
on the broadband connections to viewers’ 
homes. This is efficient since there is no benefit 
to sending a heavy, ultra high definition video 
stream to a device with a lower resolution screen 
or an internet connection that can not handle it.
The second is a drive to improve video 
compression. Successive generations of video 
compression formats allow the same quality of 
visual image to be delivered with less and less 
bandwidth. Netflix invests continually to deploy 
the most effective compression. It also optimises 
compression for different content types - using 
less data to deliver less complex video. For 
example, a video of a news anchor can be encoded 
using significantly less bandwidth than a car chase.



<!-- page 26 -->

A Netflix briefing paper
2021
26
A cooperative approach  
to content delivery
As a result of these efforts, Netflix streams are 
increasingly efficient. The number of hours a Netflix 
member can stream per GB of data has increased 
by more than 200%31 over the last five years. 
Netflix is also working alongside a number 
of companies including Samsung, Intel, Cisco, 
and Hulu in the Alliance for Open Media, a 
collaborative effort to offer open, royalty-free 
and interoperable solutions to make media 
technology more efficient. These solutions seek 
to provide superior quality for all users, on all 
devices, and on all platforms. The Alliance’s 
efforts have resulted in the launch of video 
encoding technologies that have dramatically 
improved the efficiency of high quality video 
streaming across the industry.
 
Conclusion
These encoding improvements and deployment 
of Open Connect offer substantial benefits to 
ISPs, including cost savings, the stability of 
services they provide, and increased revenues. 
ISPs may see significant reductions in transit 
costs from moving content closer and ISPs who 
deploy servers in multiple locations may also 
see a reduction in the need for infrastructure 
to connect those locations. Maintaining 
international connectivity is costly as it involves 
infrastructure that spans long distances. Long 
distance connections have more opportunity to 
become congested by high traffic loads, which 
can lead to a poor experience for the consumer. 
Delivery through Open Connect “opens up 
the pipes” of an ISP to reduce the chances of 
congestion impacting Netflix or other application 
quality. The increased quality of video delivered 
via a CDN can lead to reduced churn for the ISP.
In the past five years, Netflix’s encoding has more 
than doubled the data efficiency of streaming
 Based on the latest encoding profile.
31
5
0
10
15
20
25
Hours of streaming per 4GB of data
2019 AL1-VP9
2015 CBE1-AVCMain
2018 AL1-AVCHigh
2020 CE4-DO-HEVC
2020 AV1
It once took 4GB to 
stream 11 hours of content 
Netflix
members now 
stream 25 hours 
for 4GB



<!-- page 27 -->

A Netflix briefing paper
2021
27
A cooperative approach  
to content delivery
Threats to  
the ecosystem
3
Understanding 
traffic charges
The case for traffic charges
Dangers of traffic charges
28
31



<!-- page 28 -->

A Netflix briefing paper
2021
28
A cooperative approach  
to content delivery
In recent years, one of the key changes to which the 
internet has adapted has been the increase in video traffic. 
Improving access networks, rapidly falling  
costs of transmission and substantial investment 
in CDNs by video providers now enable 
subscribers to reliably watch high quality  
video on a range of devices.
As we have seen, the growth in video 
(supported by CDNs) has had benefits for 
consumers, content providers, ISPs and society  
as a whole. 
However, these benefits rely on a somewhat 
unstable equilibrium of mutual cooperation to 
invest in efficient delivery. There is no requirement 
to move content closer to consumers. An 
uncongested long haul connection can still 
deliver high quality video.32 Thus a relatively 
small disincentive to bringing content closer to 
Latency may be increased if there is an international leg, but 
this is relatively unimportant for video. However, if the transit 
link is congested, then there is a risk of packet loss and lower 
quality video.
ETNO, ETNO paper on Contribution to WCIT,  
7 September 2012.
32
33
consumers may prompt a content provider to stay 
further away. However, this would cause additional 
costs for the ISP, and increase the likelihood of 
congestion on back-haul networks. 
It is important not to inadvertently create 
incentives that would undo the cooperative 
approach that has led to the investments in 
moving content closer by way of Content Delivery 
Networks. Despite these risks, some governments 
and ISPs have considered charging content 
providers for access to networks. This is likely 
to harm consumers, through double charges for 
connectivity, less competition, and ultimately 
poorer performance. In this chapter we consider  
the (flawed) case made for traffic charges,  
and then turn to the damage they may cause.
The case for traffic charges
The most frequent argument in favor of traffic 
charges is that ISPs are in urgent need of further 
funds for investment to support increasing traffic 
volumes and to fund wider broadband deployment. 
Past claims that traffic charges are 
essential have proven unfounded
These arguments are not new. For example, 
in 2012, ETNO, the European association of 
incumbent telecoms operators, argued that:  
Today there is a huge disproportion amongst 
revenues and a clear shift of value towards 
players (Over the Top players ‐ OTT) who are  
not contributing to network investment. Traffic  
and revenue flows need to be realigned in  
order to assure the economic viability of 
infrastructure investment and the sustainability  
of the whole ecosystem.33



<!-- page 29 -->

A Netflix briefing paper
2021
29
A cooperative approach  
to content delivery
ETNO went on to propose the end of 
settlement-free interconnection (the collaborative 
exchange of internet traffic between ISPs and 
content providers) and the introduction of a 
‘sending party network pays’ principle - that is, 
traffic charges. This proposal was not adopted, 
but even so the internet continued to function 
perfectly well - traffic charges were not necessary 
for investment or sustainability. 
In the US there has been a ‘natural experiment’ 
in the significance of charges to content providers 
for investment. When Charter Communications 
(a US cable operator) merged with Time Warner 
Cable and Bright House Networks in 2016, the 
merger was subject to a number of conditions, 
including an obligation to offer settlement free 
interconnection with video providers.34
While this restriction has since been removed, 
we might have expected to see a degradation 
in the performance of Charter’s broadband, 
relative to other ISPs that were not restricted to 
settlement-free interconnection over the time 
period in which payments were prohibited. In 
fact, Charter has had one of the best performing 
cable broadband networks in the US, according 
to the FCC35 and the ISP Speed Index.36 The lack 
of paid interconnection (charges by an ISP to a 
content provider for a direct connection) has not 
fed through to poor performance for consumers.
Thus both in the case of ETNO members 
and of Charter, traffic charges have not been 
necessary to fund improved broadband.
Indeed, in recent years there has been a surge 
in investment in fibre broadband globally. Much 
of this has been purely commercial, and has not 
needed traffic charges as a justification. 
Traffic charges are a poor  
mechanism to support investment
Even if new sources of funds were necessary to 
support broadband investment, traffic charges 
would be a poor mechanism. This is because any 
payments received by ISPs would be ‘untied’ 
- that is, there would be no requirement for the 
funds to be spent on broadband infrastructure. 
ISPs may have many uses for their cash - the 
purchase of sports rights for an IPTV service, 
acquisitions, returning cash to shareholders and 
so on. These are all perfectly legitimate - but 
funds received from traffic charges may be spent 
on these, rather than on the broadband upgrade 
that was the purported purpose.
Better interventions are  
available to support widespread 
broadband deployment
While traffic charges are not an appropriate 
tool to support network investment, we are not 
suggesting there is never a case for external 
support. For example, there is a clear social 
case for supporting the provision of good-
quality broadband in rural areas where it may be 
commercially unviable to deploy. However, there 
are many available interventions to support rural 
broadband, and indeed many countries already 
have such interventions in place. For example, 
in the United States some states are providing 
funding to support broadband deployment in 
unserved and underserved areas through grant 
programs that fund a portion of the cost of 
deployment in these communities.37 
Traffic charges would be an untargeted and 
inefficient way to support rural broadband.  
They also carry significant dangers.
US Department of Justice, Justice Department Allows 
Charter’s Acquisition of Time Warner Cable and Bright 
House Networks to Proceed with Conditions, 25 April 2016.
FCC, Ninth Measuring Broadband America Fixed  
Broadband Report, 3 August 2020
https://ispspeedindex.netflix.net/country/us
The Pew Charitable Trusts, How States Are Expanding 
Broadband Access, February 2020
34
35
36
37



<!-- page 30 -->

200
%
The number of hours a Netflix  
member can stream per GB  
of data has increased over  
the last five years
A Netflix briefing paper
2021
30
A cooperative approach  
to content delivery



<!-- page 31 -->

A Netflix briefing paper
2021
31
A cooperative approach  
to content delivery
The termination monopoly
The termination of traffic - final delivery to a 
consumer - is the last great telecom monopoly. 
If a given user requests a video stream while 
connected to a particular ISP, the video provider 
has no option but to send that stream via that ISP. 
This remains true even if the user has access 
to other networks. It is clearly not possible for 
the video provider to request that the user 
disconnect from their home wifi and switch to 
4G, to watch the video in question. 
The danger of termination monopolies is one 
of the reasons regulators have been so active in 
the regulation of voice termination rates on both 
fixed and mobile networks over many decades. 
Without this regulation, there would have been  
a real risk of excessive pricing by telcos.
The termination monopoly for internet traffic 
is relatively benign if a consumer’s ability to 
reach any content of their choice is not impacted 
by that ISP. However, if ISPs charge for the 
termination of internet traffic then consumers’ 
ability to reach content may be restricted to 
those content providers that are able to pay. 
Furthermore, restricting consumers to only 
a subset of content, not a broad spectrum of 
content they might not otherwise encounter, 
deprives society of a rich content portfolio. 
The risk of a termination monopoly is 
exacerbated in markets where consumers 
face challenges switching ISPs - either due to 
limited competition, long-term contracts, or high 
switching costs. But even in markets where there 
is competition among ISPs, a content provider can 
only reach consumers through their chosen ISP. 
Dangers of traffic charges
Theoretical alternate routes to the consumer
ISP
Traffic from content 
provider via transit
Traffic from content 
provider via peering
User
Content
provider
Transit
provider



<!-- page 32 -->

A Netflix briefing paper
2021
32
A cooperative approach  
to content delivery
Alternate routes to consumer  
often not realistic in practice
It is sometimes argued38 that such termination 
monopolies are unproblematic because content 
providers have various routes to a given ISP.  
For example, the content provider might have  
a direct connection to the ISP via peering39 and  
an indirect connection via transit, as shown on 
the previous page. (Alternatively, they might  
have CDN servers on-net - that is within the  
ISP - and transit).
However, this is often more the illusion  
of choice than the reality. The ISP ultimately 
controls all of these routes into its network 
and can modulate the quality and potentially 
the pricing of both these routes. (The ISP 
might charge the transit provider for paid 
interconnection, for example). Thus, this 
apparent choice of route for the content  
provider invariably leads back to the access 
provider, who is at best competing with itself. 
Further, transit links are unlikely to have the 
capacity to absorb traffic redirected from direct 
interconnection or a CDN. Ofcom (in 2017) found 
that for UK fixed networks, transit represented 
just 5% of their traffic,40 and transit capacity is 
presumably provisioned accordingly.  
As we have seen, Netflix alone might represent 
11% of an ISP’s traffic. Thus if Netflix were to 
switch its traffic to transit from Open Connect, 
16% of the relevant ISP’s traffic would be flowing 
through circuits designed for 5%. (Even this 
assumes that routes are available through all 
the ISPs’ transit connections, which is far from 
certain). This would lead to massive congestion 
and consequently a catastrophic degradation 
of quality for Netflix’s services. Netflix’s 
competitors, likely still delivered via CDNs within 
the ISP’s network, would be largely unaffected.
This congestion would also create some 
problems for the ISP, since other services arriving 
via transit would also be affected.
See, for instance, Laure Jaunaux & Marc Lebourges 
(Orange Regulatory Department). Externalities between 
on-line contents drive telecom operators’ incentives to 
provide quality open internet through neutral network,  
14 January 2019.
Peering refers to a direct connection to exchange traffic 
between two networks, generally at zero cost.
Ofcom, Connected Nations 2017  
- Data analysis, 15 December 2017.
38
39
40



<!-- page 33 -->

1000 Mbps
200 films
100 Mbps
20 films
25 Mbps
5 films
A Netflix briefing paper
2021
33
A cooperative approach  
to content delivery
Fast times
As broadband speeds get faster, Netflix streams take up less and less 
of a member’s purchased bandwidth. Netflix recommendsjust 5 Mbps 
to stream a high-definition movie on Netflix on a fixed line connection. 
That means a Netflix member with a high speed broadband connection 
has enough bandwidth to stream multiple HD videos at the same time



<!-- page 34 -->

A Netflix briefing paper
2021
34
A cooperative approach  
to content delivery
Potential for leveraging  
into video markets
The threat of this termination monopoly is not 
simply a matter of the price paid for termination. 
Many ISPs compete directly with streaming video 
services, either because they are themselves 
a cable TV operator, or a telco with an IPTV 
offering. By 2024, 45% of Western European 
households are expected to take TV from a 
telco or cable operator.41 ETNO has noted 
that “Operators supplying traditional pay-TV 
within Western Europe continue facing strong 
competitive pressures from OTT services  
[such as Netflix and Amazon].”42
Thus for any ISP with its own TV service, any 
degradation of quality for other video providers 
strengthens the competitive position of that TV 
service. This risks providing an incentive to take 
advantage of the terminating monopoly in a way 
that is detrimental to consumers.43
Potential for double charging
ISPs seeking to charge content providers for 
the carriage of traffic have almost universally 
already charged their consumers for carriage 
of that same traffic. Both mobile and fixed 
broadband products include data allowances 
(often ‘unlimited’ for fixed). Consumers have paid 
for these data allowances on the understanding 
that it will allow them to reach the entire internet, 
not just those sites that have agreed to pay to 
be distributed by their ISP. Further, if consumers 
have paid for traffic, to also charge content 
providers would appear to be a double-charge.
This problem is best illustrated when the 
speeds required for the content being delivered 
is well under the speeds paid for by consumers. 
The average global fixed line broadband speed 
is 87.84 Mbps44 and this is much more than is 
needed to watch video. A Netflix member should 
theoretically be able to watch 17 simultaneous 
HD streams (of 5 Mbps each) with a connection  
of this speed.
Perverse incentives
The only way for an ISP to force a content 
provider to pay for traffic charges is to ensure 
congestion otherwise limits an ISP’s customers 
from receiving requested traffic from the content 
provider. This congestion represents powerful 
leverage for the ISP to force the content provider 
to accept the demanded cost to connect directly, 
and thus the ISP has little incentive to remedy 
the congestion. 
This potential leverage has caused concern 
to regulators in the context of ISP mergers,45 
and, in the past, ISPs have been known to use 
congestion in this way.46
Digital TV Europe, Rise of IPTV to benefit Telcos,  
23 May 2019.
ETNO, The state of digital communications 2020,  
28 January 2020.
For a detailed discussion of these issues, see David Evans, 
Comcast’s Acquisition of Time Warner Cable Would Result 
in an Economically Significant Increase in the Magnitude of 
Terminating Access Fees for Online Video Distributors,  
6 April 2015.
Speed Test Global Index, https://www.speedtest.net/global-
index, Accessed on 3 December 2020. The global average 
download speed for October 2020 was 87.84 Mbps.
See for example ¶550 onwards of European Commission, 
Case M.7000 - LIBERTY GLOBAL / ZIGGO, 30 May 2018 
A number of such interconnection disputes are discussed 
in Daniel A. Lyons, “An Antitrust-Informed Approach to 
Regulating Internet Interconnection.” Journal of Science  
& Technology Law 24, no.2 (2018): 229-276
41
42
43
44
45
46



<!-- page 35 -->

A Netflix briefing paper
2021
35
A cooperative approach  
to content delivery
If an ISP does impose charges for 
interconnection or on-net CDNs, then this 
gives content providers two choices: pay those 
charges, or deliver their traffic via offshore 
methods (e.g. via transit or non-localised 
interconnection). Transit prices have had a 
long-run trend of brisk decline, so in financial 
terms this can be an attractive option for content 
providers. This would result in backbone and 
transit links being used for content that can be 
more efficiently delivered, both in terms of cost 
and capacity, by means of local content servers. 
While traffic charges by an ISP may force 
such an outcome, it is clearly suboptimal. For the 
ISP itself, it will likely mean that it is now paying 
to receive the traffic, since it may need to pay 
transit charges to the relevant transit provider. 
Moreover, if the ISP is buying its transit at a 
remote location, then it will need to invest in 
international backhaul capacity also.  
Avoiding such costs is one of the key reasons 
more than 7,000 ISPs around the world use 
Open Connect to receive traffic. Larger ISPs  
may tolerate these increased costs in order to 
force through traffic charges, but there is still  
risk to consumers.
Consumers invariably lose in this situation. 
They will be exposed to the risk of congestion in 
transit links, with possible degradation of their 
user experience. Increased latency may also 
cause problems (though less so for streamed 
video, which is not latency-sensitive). There is 
also a risk that consumers will lose access to 
the plurality of voices and applications that have 
enabled the internet to thrive.
Transit price CAGR, 2017-2047
TeleGeography, Global IP Transit Prices Keep 
Doing What They Do Best, 8 September 2020.
47
-40%
-50%
-30
-20
-10
0
Miami
Johannesburg
Sao Paulo
London
Singapore
Sydney
Mumbai
CAGR



<!-- page 36 -->

A Netflix briefing paper
2021
36
A cooperative approach  
to content delivery
Conclusion
A cooperative model is win-win for consumers.  
At the heart of the internet’s value is the fact that it 
is an adaptable network of networks which enables 
the communication and sharing of information and 
content between people, irrespective of location.
In recent years, one of the key changes to which 
the internet has adapted has been the increase in 
video content. In order to support this increase in 
traffic, content providers like Netflix have worked 
hand in hand with ISPs. 
In Netflix’s case we invest significantly in 
content, which drives demand for broadband 
internet access. We invest in delivery infrastructure 
(OCAs and backhaul infrastructure) and 
compression technology. In both cases, we have 
not only innovated on existing industry standards, 
but also actively participated in standardization 
activities to ensure constantly improving efficiency 
across the industry as a whole. 
We have made these investments in  
delivery because we want to give our members 
the best experience possible no matter what  
the available bandwidth is or the capability  
of their viewing device. 
And our investments have also reaped 
significant benefits for ISPs - increased 
revenues, greater broadband takeup - and for 
many ISPs Open Connect has enabled them to 
avoid the costs of expensive international transit. 
It has also generated benefits to society. The 
availability of high quality video gives consumers 
a reason to go online in the first place and to 
upgrade their broadband connections, promoting 
greater connectivity. 
Looking to the future we are keen to continue 
to work in partnership with ISPs in this way to 
ensure that content is delivered to our members 
in the most efficient way possible. However 
a cooperative model will only be sustained 
if content providers and ISPs continue to 
recognize the complementary nature of networks 
and content. In addition, if governments 
acknowledge the important role that content 
providers play in stimulating demand for 
broadband services and establish supporting 
policy frameworks which restrict the imposition 
of charges by ISPs on content providers.



<!-- page 37 -->

A Netflix briefing paper
2021
37
A cooperative approach  
to content delivery
Glossary of terms
CAGR
Compound Annual Growth Rate
Cache 
A temporary local copy of information that 
originated elsewhere. Thus for CDNs, a copy  
of files to be delivered to consumers, stored  
in a local server
CDN (Content Delivery Network)
A distributed system of servers, designed to 
enable the efficient and reliable distribution of 
content over the internet
CP (content provider)
An internet business whose focus is delivering 
content (rather than - say - e-commerce)  
to consumers. Netflix, CNN and YouTube  
are examples
FBB
Fixed broadband
Hop
One step in a packet of data’s journey  
across multiple servers
ISP (Internet Service Provider)
A company providing internet connectivity  
to consumers (consumers or businesses). May 
provide fixed broadband, mobile data or both
IXP (Internet Exchange Point)
A location where many networks meet  
to exchange traffic, avoiding the need  
for multiple bilateral connections
Latency
The lag between a packet of data being  
sent and reaching its destination
OTT (Over The Top) 
Describes services delivered over another 
network without being integrated with it.  
YouTube, Facebook and Netflix are examples 
(since they are not provided by telcos operating 
broadband networks)
Packet loss
When a router is sent more data than it can 
handle, it discards a certain amount of data.  
This is known as packet loss. Typically the  
data in question will then be requested again 
from the source server
Router
A switch on the internet, that receives packets 
of data and sends them onwards down the 
appropriate link
Server
A computer that stores and  
transmits content 
TCP/IP
Transmission control protocol and internet 
protocol. The two foundational standards for 
data transmission that underpin the internet



<!-- page 38 -->

A Netflix briefing paper
2021
38
A cooperative approach  
to content delivery
Appendix
The Internet (TCP/IP) protocol enables easy physical 
interconnection between two networks that both 
use it. However, there is also a commercial aspect 
to interconnect - does money flow between the two 
parties and what extent of connectivity is provided?
There are two primary categories of 
interconnection, namely transit and direct 
interconnection (with some variety under  
each heading). We discuss these below.
Transit 
and peering



<!-- page 39 -->

A Netflix briefing paper
2021
39
A cooperative approach  
to content delivery
Transit
Transit is typically used by an ISP (or content 
provider - CP) to reach the parts of the internet 
not available to it via other types of connection, 
such as interconnection. The ISP buys transit 
from a transit provider, who in turn links (directly 
or indirectly) to all other networks on the internet, 
and their associated consumers.
For destination ISPs and CPs on its own 
network, the transit provider passes the traffic 
on directly. For other destinations, it will connect 
with other transit providers, who will in turn pass 
the traffic on to the destination in question. Since 
essentially all ISPs and CPs are connected to at 
least one transit provider, connection via such 
providers enables universal connectivity.48
While transit provides universality, it has two 
major disadvantages. Firstly, it comes at a cost.  
The ISP or CP must pay in relation to the amount  
of traffic carried via the transit link.49
Secondly, it may lead to inefficient traffic 
routing. An ISP may have to procure transit from 
a provider that is not based in their own country, 
but (say) in the US. If so, all traffic sent by the ISP 
will have to travel to the US, even if it is destined 
for a consumer in the ISPs’ own country. This is 
known as traffic tromboning. It is expensive, since 
both the sending and the receiving provider must 
pay for pricey international capacity. It is also 
technically poor, since the long journey introduces 
latency and the potential for packet loss.50
It is also possible to buy partial transit, where the transit 
provider offers connectivity only to certain destinations
Transit is typically priced on a 95th percentile basis - that is, 
based on ‘near peak’ bandwidth demand, but setting aside 
the busiest 5% of periods
While tromboning is becoming rare in larger internet markets, 
it remains a significant problem in some smaller markets. 
See, for instance, UN ESCAP, An In-Depth Study of the 
Asia-Pacific Information Superhighway in CLMV Countries, 
March 2020
48
49
50



<!-- page 40 -->

Illustration of transit
Illustration of peering
Peering
ISP
Broadband
access
ISP
Broadband
access
ISP
Broadband
access
ISP
Broadband
access
Content
provider
Transit
provider
Cash flow
Transit
provider
Content
provider
User
User
User
User
A Netflix briefing paper
2021
40
A cooperative approach  
to content delivery



<!-- page 41 -->

A Netflix briefing paper
2021
41
A cooperative approach  
to content delivery
Direct  
interconnection
The main alternative to transit is direct 
interconnection through peering. When two 
networks peer, they connect, but only for traffic 
destined for their respective networks. For 
example, ISPs X and Y might peer, and the 
traffic flowing over the link would be any traffic 
travelling from ISP X’s consumers to ISP Y’s 
consumers, and vice versa.51
ISPs may peer, but so too can ISPs and 
content providers. In this scenario the traffic 
flowing would primarily be the content destined 
for the ISP’s users.
There are a range of types of interconnection. 
It may be public or private. Public interconnection 
takes place via an Internet Exchange Point (IXP), 
a physical location where many networks come 
together to exchange traffic. This is efficient for 
connecting with many different peers. Private 
interconnection takes place via a direct physical 
connection between two networks. This may be 
lower cost and more reliable if a large volume of 
traffic is being exchanged.
Peering may also be settlement-free or paid. 
In settlement-free interconnection, no money 
is exchanged between the peers. This was the 
basis of all interconnect in the early days of the 
internet, and remains very common. Generally 
interconnection links are mutually beneficial, 
and so both parties gain even if they are unpaid. 
Further, if there is no payment then contracts can 
be far simpler. Indeed, interconnection based on 
a handshake (i.e. without a written contract) is 
very common.
That said, networks often have certain criteria 
that they apply to certain peers, to avoid being 
gamed. For example, a network with expensive 
international connectivity might be reluctant to 
peer with a purely local network, since it would 
pick up the lion’s share of the cost of transmitting 
traffic between the two networks’ customers.
Sometimes networks only offer 
interconnection if traffic flows are roughly 
balanced - that is, there is a similar volume of 
traffic flowing from peer X to peer Y as is flowing 
in the opposite direction. This does ensure that 
the two parties are imposing similar traffic costs 
on each other. However, this is not necessary for 
settlement free interconnection to be merited. 
Asymmetric traffic may create value for both 
parties, even if costs are not balanced. For 
instance, YouTube may send a lot of traffic to 
a small ISP, but that ISP gets great value from 
making YouTube available to its consumers
While settlement-free interconnection is 
common, there is also paid interconnection, 
where one party pays the other. This may arise 
where one party gets much less value out of the 
interconnection (and so requires compensation), 
or where one party has leverage, and can simply 
insist on payment.
‘Partial interconnection’ is also possible, where 
peers only agree to connect certain subsets of 
their customers, similar to partial transit
51



<!-- page 42 -->




