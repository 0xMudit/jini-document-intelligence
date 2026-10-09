# Pensieve-Neural-Adaptive-Video-Streaming

- **Source file:** Pensieve-Neural-Adaptive-Video-Streaming.pdf
- **Pages:** 12
- **Creation date:** D:20180717010016Z

---

<!-- page 1 -->

Absence of Luttinger’s theorem for fermions with power-law Green functions
Kridsanaphong Limtragool, Zhidong Leong, and Philip W. Phillips
Department of Physics and Institute for Condensed Matter Theory,
University of Illinois 1110 W. Green Street, Urbana, IL 61801, U.S.A.
(Dated: July 17, 2018)
We investigate the validity of Luttinger’s theorem (or Luttinger sum rule) in two scale-invariant
fermionic models. We ﬁnd that, in general, Luttinger’s theorem does not hold in a system of fermions
with power-law Green functions which do not necessarily preserve particle-hole symmetry. However,
Ref. [1, 2] showed that Luttinger liquids, another scale-invariant fermionic model, respect Luttinger’s
theorem. To understand the diﬀerence, we examine the spinless Luttinger liquid model. We ﬁnd
two properties which make the Luttinger sum rule valid in this model: particle-hole symmetry
and ImG(ω = 0, −∞) = 0. We conjecture that these two properties represent suﬃcient, but not
necessary, conditions for the validity of the Luttinger sum rule in condensed matter systems.
I.
INTRODUCTION
A key problem in modern condensed matter physics
involves identifying the propagating degrees of freedom
in the normal state of cuprate superconductors. Since
Landau’s Fermi liquid theory fails to explain many fea-
tures in the normal state, e.g., T-linear resistivity, the
pseudogap, and Fermi arc formation, the low-energy de-
grees of freedom lie elsewhere. To progress further, one
needs to know how the emergent charge carriers in the
infrared are related to the bare electrons. For a Fermi
liquid, Luttinger’s theorem [3] relates the density of elec-
trons at ﬁxed chemical potential to the number of exci-
tations in the Fermi liquid (i.e., Fermi surface volume)
[4]. However, the original proof of the theorem for inter-
acting electrons [3, 5] relies on perturbation theory. This
leads to the question of whether Luttinger’s theorem still
holds in a strongly correlated fermionic system such as
the normal state of the cuprates. Equivalently, is there a
version of this theorem that is valid independent of the
Fermi liquid ansatz?
Mathematically, Luttinger’s theorem for a system of
spin-1/2 fermions states that the particle density n
is given in terms of the single-particle Green function
G(p, ω) by
n = 2
X
p
θ(G(p, ω = 0)),
(1)
where θ(x) is the Heaviside function.1
Recall that
G(p, ω →−∞) =
1
ω < 0 for fermions, and notice that
the Heaviside function is nonzero only when G(p, ω =
0) > 0. Consequently, only momenta at which G(p, ω)
changes sign from negative to positive as ω increases from
−∞to 0 contribute to the sum.
For a Fermi liquid,
GF L(p, ω) =
1
ω−εp with εp being the energy dispersion.
Thus for a Fermi liquid, the summation counts the num-
ber of simple poles or the number of single particle exci-
tations below the Fermi surface.
1 We consider only spinless fermions in this paper. The spin de-
generacy factor in Eq. 1 will be dropped in subsequent sections.
However, zeros also contribute to the sum in Eq. (1).
Zeros are relevant to strongly correlated systems such as
the cuprates in which one signature of the parent Mott
insulator and the pseudogap phases is the appearance
of zeros in the single-particle Green function [4, 6–10].
One of us [11] showed that, when a single-particle Green
function has zeros, the Luttinger sum in Eq. 1 does not
necessarily give the particle density. This stems from the
fact that in the proof of Luttinger’s theorem, the density
has the form n = I1 + I2, with I1 = 2 P
p
θ(G(p, ω = 0))
and I2 vanishing when the Luttinger-Ward (LW) func-
tional exists. However, if the Green function has zeros
(or, in other words, the self-energy diverges), the LW
does not exist. Hence, I2 is not guaranteed to be zero.
Another signature of the cuprates’ normal state is the
power law behavior of its physical properties. Since scale
invariance and quantum criticality are widely used to ex-
plain these behaviors [12–17], it is important to study the
validity of Luttinger’s theorem for systems with scale-
invariant Green functions. A concrete example would be
the Green function of fermionic unparticles used in Ref.
[18]. The Green function is of the form, G ∼
1
(ω−εp)α ,
where α is an anomalous exponent with α = 1 cor-
responding to a Fermi liquid.
While unparticles were
originally proposed by Georgi [19] as a low-energy scale-
invariant sector in the standard model, one of us [20] has
applied the notion of unparticles to explain the break-
down of the particle picture in the cuprates. Models in-
volving unparticles were later also used to explain the
power laws in the transport properties [21] and the elec-
tronic scattering rate [18, 22] observed in the cuprates.
In this paper, we investigate the validity of Luttinger’s
theorem to spinless fermionic systems with a power-law
Green function of the form, G ∼
1
(ω−εp)α .
By explic-
itly calculating the density of fermions, we ﬁnd that Lut-
tinger’s theorem does not hold in general. Only when
1 < α < 2 with speciﬁc values of parameters can the
Luttinger sum rule be satisﬁed.
However, according
to Ref.
[1, 2], Luttinger’s theorem is in fact valid for
Luttinger liquids, another fermonic system with a scale-
invariant Green function. To resolve this discrepancy, we
directly verify Luttinger’s theorem for the spinless Lut-
arXiv:1708.08460v4  [cond-mat.str-el]  15 Jul 2018



<!-- page 2 -->

2
tinger model [23] by explicitly computing the density.
We identify two important properties necessary for Lut-
tinger’s theorem to be valid in this model: particle hole
symmetry and ImG(ω = 0, −∞) = 0. These properties
are what is required for Luttinger sum rule to be valid in
the Hubbard model [8] and the SU(N) Hubbard model
[11]. We conjecture that they are suﬃcient, but not nec-
essary, conditions for the validity of Luttinger’s theorem.
II.
FERMIONS WITH POWER-LAW GREEN
FUNCTIONS
We are interested in testing the validity of Luttinger’s
theorem when the fermionic Green function,
G(λεp, λω) = λ−αG(εp, ω),
(2)
has a scaling form. Here, we specify that the Green func-
tion depends on momentum p through a dispersion rela-
tionship εp. For concreteness, we consider the power-law
Green function,
G(p, ω) =
N
(ω −εp)α ,
(3)
where α is an anomalous exponent and N is the normal-
ization factor. The normalization factor N can be speci-
ﬁed by requiring that the spectral function A ≡−1
πImGR
satisfy the sum rule,2
Z
A(p, ω)dω = 1,
(4)
with GR being the retarded Green function.
When α = 1, this Green function simply describes
quasiparticle excitations. Therefore, we focus on the case
in which α is not an integer with 0 < α < 2. Hence, the
Green function in Eq. 3 has a branch cut extending from
ω = εp in the complex ω space. We choose the branch
cut to lie along the negative real axis with phase angle,
φ, deﬁned in the range −π < φ ≤π.
As the Green
function in Eq. 3 represents the low-energy theory of a
system, by construction its range of validity is within an
energy width −E < ω < E, where E is the UV or high
energy cutoﬀ, assumed to be much greater than |εp|. We
will see below in Eq. 8 that this assumption keeps the
normalization factor momentum independent.
When α > 1, the theory has an infrared divergence.
So, it is necessary to impose a low energy cutoﬀ, δ, as-
sumed to be much smaller than both E and εp.
We
explicitly include this δ in both the 0 < α < 1 and
1 < α < 2 cases. We treat δ as ﬁnite when 1 < α < 2
and set δ = 0 when 0 < α < 1 at the end of the calcu-
lation. The infrared cutoﬀδ represents the breaking of
scale invariance in a similar fashion to that in Ref. [24].
2 We omit spectral weights coming from physics or eﬀects beyond
the UV cutoﬀ, such as those from interband transitions (or core
electrons).
A.
Luttinger’s theorem for fermions with
power-law Green functions
Luttinger’s theorem in the form of Eq.
1 implicitly
assumes the Green function at frequencies ω = −∞and
ω = 0 to be real (or equivalently the imaginary part of
the self-energy is zero at these two frequencies).
This
assumption is true for a Fermi liquid because the imagi-
nary part of the self-energy ImΣ(ω) ∝ω2 →0 as ω →0.
However, this assumption does not hold for the power-
law Green function in Eq. 3 because the Green function
is not real when ω < εp.
A more general form [4, 25] of Luttinger’s theorem
which does not require the Green function to be real (but
is still based on a perturbative argument) is given by
n =
Z
ddp
(2π)d
1
π (φR(0) −φR(−∞)) ,
(5)
where φR(ω) is the phase of the retarded Green function
at frequency ω.
Since we are considering a system of
spinless fermions, Eq. 5 does not have a factor of 2 in
front, unlike Eq. 1. Notice that this equation reduces to
Eq. 1 (without the spin degeneracy factor) when ImΣ
vanishes at ω = −∞and ω = 0.
For the power-law
Green function, we interpret ω = −∞as the negative
UV cutoﬀenergy −E. Then, the phase of the retarded
Green function at ω = −E is
φR(−E) =
(
−απ
if 0 < α < 1,
−απ + π
if 1 < α < 2,
and the phase at ω = 0 is
φR(0) =
(
−απ(1 −θ(−εp))
if 0 < α < 1,
−απ(1 −θ(−εp)) + π
if 1 < α < 2.
For both 0 < α < 1 and 1 < α < 2, one has
φR(0)−φR(−E) = απθ(−εp). Consequently, Luttinger’s
theorem from Eq. 5 claims that the density
n = α
Z
ddp
(2π)d θ(−εp).
(6)
This result is similar to that of Luttinger’s for a Fermi liq-
uid, n =
R
ddp
(2π)d θ(−˜εp), with ˜εp being the renormalized
dispersion. The main diﬀerence is the prefactor α which
comes from the fact that the Green function is complex.
B.
Spectral function
To check the validity of Luttinger’s theorem, one needs
to know the density of the system. We begin by comput-
ing the spectral function which is equal to the disconti-



<!-- page 3 -->

3
FIG. 1.
A plot of the spectral function A(ω) of fermions
with power-law Green functions.
The anomalous exponent
α = 1.2. Other values of α in the range 0 < α < 2 have the
same qualitative behavior for A(ω).
nuity of the Green function across the branch cut,
A(p, ω) = −1
π ImG(p, ω + iη)
= −N
2πi

1
(ω + iη −εp)α −
1
(ω −iη −εp)α

= −N
2πi
θ(εp −δ −ω)
|εp −ω|α
 1
eiπα −
1
e−iπα

= N sin πα
π
θ(εp −δ −ω)
|εp −ω|α
.
(7)
The normalization factor N can be obtained from the
spectral sum rule (Eq. 4). Substituting Eq. 7 into Eq. 4
and then solving for N, one ﬁnds that
N = (1 −α)π
sin πα
1
(E + εp)1−α −δ1−α
= (1 −α)π
sin πα
1
E1−α −δ1−α .
(8)
Here, we have used the assumption E ≫|εp|. This as-
sumption is important for keeping N independent of εp.
Note that the last line of Eq. 7 is positive even when
1 < α < 2, because N is negative for such an α. Explic-
itly, the ﬁnal expression for A(p, ω) is given by
A(p, ω) =
|1 −α|
|E1−α −δ1−α|
θ(εp −δ −ω)
|εp −ω|α
.
(9)
Fig. 1 shows a plot of the spectral function for α = 1.2.
For a given momentum p, there are excitations at all
energies ω < εp. This behavior stems from our choice of
the branch cut which lies along the negative real axis.
C.
Occupation number
The occupation number in terms of A(p, ω) is given by
n(p) =
Z
dωnf(ω)A(p, ω),
(10)
where nf(ω) ≡
1
eβω+1 is the Fermi-Dirac distribution.
The density of the system can then be calculated by in-
FIG. 2. A plot of the occupation number n(p) of fermions
with power-law Green functions. The parameters used here
are E = 50, and δ = 0.1.
tegrating n(p) over all momenta p,
n =
Z
ddp
(2π)d n(p).
(11)
At T = 0, the Fermi-Dirac distribution becomes a step
function, nf(ω) = θ(−ω). By inserting 1 = θ(εp −δ) +
θ(−εp + δ) into the integrand of Eq. 10 and then inte-
grating over ω, we obtain
n(p) =
E
Z
−E
dωθ(−ω)[θ(εp −δ) + θ(−εp + δ)]A(p, ω)
=
sin πα
π(1 −α)Nθ(εp −δ)[(E + εp)1−α −ε1−α
p
]
+ sin πα
π(1 −α)Nθ(−εp + δ)[(E + εp)1−α −δ1−α].
Finally, substituting N from Eq. 8 into this equation and
taking the limit E ≫|εp|, one has
n(p) = θ(−εp + δ) + θ(εp −δ)E1−α −ε1−α
p
E1−α −δ1−α . (12)
For 0 < α < 1, setting δ = 0, one obtains
n(p) = θ(−εp) + θ(εp)

1 −
εp
E
1−α
,
(13)
while for 1 < α < 2, taking the limits E ≫δ and E ≫
|εp| gives
n(p) = θ(−εp + δ) + θ(εp −δ)
 δ
εp
α−1
.
(14)
Fig. 2 shows a plot of the occupation number n(p) for
various values of α. Since the occupation number is one
for εp < 0 and nonzero for εp > 0, particle-hole symme-
try is broken. This arises because the spectral function
is nonzero only for energies below εp.



<!-- page 4 -->

4
D.
Modiﬁed Luttinger count
In the case 0 < α < 1, using Eqs. 11 and 13, we ﬁnd
that the density is
n =
Z
ddp
(2π)d θ(−εp) +
Z
ddp
(2π)d θ(εp)

1 −
εp
E
1−α
.
(15)
Comparing this result to what is claimed by Luttinger’s
theorem in Eq. 6, one ﬁnds that the density obtained here
is always greater than α
R
ddp
(2π)d θ(−εp).
Consequently,
Luttinger’s theorem never holds for fermions with the
power-law Green function when 0 < α < 1.
When 1 < α < 2, using Eqs.
11 and 14 gives the
density
n =
Z
ddp
(2π)d θ(−εp + δ) +
Z
ddp
(2π)d θ(εp −δ)
 δ
εp
α−1
,
(16)
which in general diﬀers from α
R
ddp
(2π)d θ(−εp). While Lut-
tinger’s theorem does not hold in general, we can still get
Eq. 6 and Eq. 16 to agree by ﬁne-tuning the energy func-
tion εp, the exponent α, and the cutoﬀδ. For example,
consider the case of a linear energy spectrum εp = vp in
one dimension, where the constant v has units of veloc-
ity, and the momentum p is chosen to be in the range
−Λ < p < Λ. By equating Eq. 6 and Eq. 16, one can
show that Luttinger’s theorem holds when
(α −1)Λ = δ
v +
1
2 −α
"δ
v
α−1
Λ2−α −δ
v
#
. (17)
Numerically solving for the dimensionless ratio δ/vΛ as
a function of α produces the result displayed in Fig. 3.
When solving this equation, we require δ < vΛ to reﬂect
the fact that δ is an infrared cutoﬀand thus must be
smaller than other energy scales. For a given α, the ratio
δ/vΛ is ﬁxed for Luttinger’s theorem to be valid.
Although the above calculations are based on the spec-
tral function having a sharp high-energy cutoﬀ, our re-
sults regarding the validity of Luttinger’s theorem remain
unchanged even if we use a more general form of the cut-
oﬀ(see Appendix A).
It is instructive to consider an alternate form of Green
function in which the self-energy has a power-law form,
G(p, ω) ∝
1
ω−˜εp−ΣPL(p,ω) with ΣPL(p, ω) ∝λ (ω−εp)α
Eα−1 ,
where the dimensionless parameter λ determines the
strength of correlation of the self-energy. The advantage
of this Green function over the power-law Green function
(Eq. 3) is that it follows the canonical form of the Green
function for an interacting system, i.e., G ∼
1
ω−εp−Σ,
and thus it is more physical than the power-law Green
function. Nonetheless, this Green function reduces to the
power-law Green function in the limit λ →∞. In Ap-
pendix B, we investigate the validity of Luttinger’s theo-
rem for this alternative Green function. We numerically
FIG. 3. A plot of δ/vΛ vs. α obtained by solving Eq. 17 in
the case δ < vΛ. This shows the combination of parameters
needed for Luttinger’s theorem to be valid.
compare both sides of Eq. 5. We ﬁnd that, in general,
Luttinger’s theorem is not valid.
III.
LUTTINGER’S THEOREM FOR THE
SPINLESS LUTTINGER LIQUID
Luttinger liquids are another fermionic system with
a scale-invariant Green function.
However, unlike the
result we obtained above, Luttinger’s theorem has been
shown to be satisﬁed in Luttinger liquids[1, 2]. To under-
stand this discrepancy, we analytically verify Luttinger’s
theorem for a simple version of a Luttinger liquid, i.e.,
the spinless Luttinger model from Ref. [23]. The Hamil-
tonian of this model is given by
H = H0 + HI.
(18)
The non-interacting part of the Hamiltonian, H0, is
H0 =
X
α=±
X
|p−αpf |<Λ
vf(αp −pf)c†
α,pcα,p,
(19)
where α = + denotes the right-moving fermions (right
movers) and α = −denotes the left-moving fermions
(left movers). The operators c†
α,p and cα,p are the fermion
creation and annihilation operators in momentum space,
respectively. (In real space, we denote the fermions by
ψα(x) and ψ†
α(x).) Also, vf and pf denote the Fermi ve-
locity and Fermi momentum of the non-interacting sys-
tem, respectively. The momentum cutoﬀΛ is chosen such
that, in the momentum range −Λ < p −αpf < Λ, the
non-interacting dispersion is linear. The fermion-fermion
interaction, HI, is given by3
3 One can show that this is the same interaction as Ref.
[23] by transforming to a bosonic basis [23, 26, 27], b†
p
=

2π
L|p|
 1
2
P
α=±
θ(αp)ρα(−p) and bp =

2π
L|p|
 1
2
P
α=±
θ(αp)ρα(p).



<!-- page 5 -->

5
HI =
Z
dx
Z
dx′ 1
2V (x −x′) [ρ+(x)ρ+(x′) + ρ−(x)ρ−(x′) + ρ+(x)ρ−(x′) + ρ−(x)ρ+(x′)] ,
(20)
where ρα(x) ≡ψ†
α(x)ψα(x) is the density of fermions in
branch α at point x. The ﬁrst two terms are the interac-
tions between fermions from the same branch. They are
known as the g4 process [27]. The last two terms repre-
sent the inter-branch interactions or the g2 process [27].
For a system of spin-1/2 fermions, there is also an inter-
action between two branches with their spins exchanged
or the g1 process [27]. In the spinless system, g1 is the
same as g2. In general, g2 and g4 can have diﬀerent in-
teraction strengths, but the form of HI we consider in
Eq. 20 has g4 = g2 = V .
In this section, we investigate Luttinger’s theorem for
the right-moving branch with α = +. The conclusion
we have for the right-movers should also be applicable to
the left-movers. As in the case of the power-law Green
function, we calculate the density of fermions and com-
pare it with Luttinger’s theorem. The starting point is
the spectral function of this model [23],
A+(p, ω) =
1
γΓ2(γ)
 r
2˜vf
2γ 
θ(ω −˜vf|p|)(ω + ˜vfp)γ(ω −˜vfp)γ−1e
−ωr
˜vf Φ

1, 1 + γ, r
2˜vf
(ω + ˜vfp)

+θ(−ω −˜vf|p|)(−ω −˜vfp)γ(−ω + ˜vfp)γ−1e
ωr
˜vf Φ

1, 1 + γ, r
2˜vf
(−ω −˜vfp)
 
,
(21)
FIG. 4. The plot of the spectral function A+(ω). The param-
eters used to generate the plot are p = 3, r = 0.2, ˜vf = 1, and
γ = 0.8.
where
Γ(x)
is
the
gamma
function,
Φ(a, b, x)
de-
notes the conﬂuent hypergeometric function4, ˜vf
≡
vf

1 + V (q=0)
πvf
1/2
is the renormalized velocity, r is
the interaction range, and γ determines the interaction
strength.
The precise deﬁnitions of r and γ are given
in Ref. [23]. Here, the momentum p is measured with
respect to the Fermi point, and thus the total momen-
tum is p + pf. We note that Φ(a, b, 0) = 1. As a result,
in the short interaction range limit, r →0, the spec-
tral function has a scaling form. However, at large ω,
A+(p, ω) ∼ω2γ−1 which violates the sum rule for γ > 0.
To avoid this problem, we keep r ﬁnite as a regulator
throughout the calculation. The plot of A+(p, ω) from
Eq. 21 is displayed in Fig. 4.
4 Other notations[28] of the conﬂuent hypergeometric function are
M(a, b, x) and 1F1(a, b, x).
FIG. 5. The plot of n+ vs p. The parameters used to generate
the plot are r = 0.2, ˜vf = 1, and γ = 0.8.
One can calculate the occupation number of the right
movers at T = 0 as
n+(p) =
∞
Z
−∞
dωnF (ω)A+(p, ω),
(22)
where nF (ω) = θ(−ω) is the Fermi-Dirac distribution at
T = 0. The plot of n+(p) is shown in Fig. 5. The impor-
tant feature of n+(p) is that it is an odd function with
respect to n+ = 1/2 (see Appendix D). This is a signa-
ture that the system has particle-hole symmetry. Based
on this property, the density of the right-movers at T = 0
can be computed as
n+ =
Λ
Z
−Λ
dp
2π n+(p) = Λ
2π .
(23)
From the spectral function, one can obtain the real
and imaginary parts of the retarded Green function GR
+



<!-- page 6 -->

6
(see Appendix E). We ﬁnd that GR
+ is real at ω = 0 and
ω = −∞. Furthermore, at ω = 0, GR
+ becomes positive
when p < 0. This means that Luttinger’s theorem for
the spinless Luttinger model has the standard form of
Eq. 1 (without the spin degeneracy factor). It can also
be written as
n+ =
Z dp
2π θ(−p),
(24)
which counts only states below pf. To be consistent with
the density calculation, the range of p in the momen-
tum integral is −Λ < p < Λ. The integral can then be
evaluated as
Z Λ
−Λ
dk
2π θ(−p) = Λ
2π .
(25)
The agreement between Eq. 23 and Eq. 25 means that
Luttinger’s theorem holds for the right-moving branch of
the spinless Luttinger liquid.
Two properties of this model are important for the
Luttinger sum rule to be valid. First, the Luttinger sum
rule of this model can be simpliﬁed to the traditional
form. This result stems from the fact that GR
+(p, ω) is
real at frequencies ω = 0 and ω = −∞and GR
+(p, ω)
changes sign at the momentum pf.
The second prop-
erty is particle-hole symmetry. This leads to the result
that the fermion density equals the number of states be-
low pf.
Combining these two properties, it is obvious
that Luttinger’s theorem holds in the spinless Luttinger
model. From the discussion in section II A and Fig. 2, it
is clear that fermions with power-law Green functions do
not satisfy either of these properties.
IV.
DISCUSSION AND CONCLUSION
The key result of this paper is that, in general, Lut-
tinger’s theorem is not valid for fermions with power-law
Green functions. However, one cannot conclude whether
Luttinger’s theorem holds for a fermionic system based
solely on the fact that its Green function satisﬁes a scal-
ing form (Eq. 2). Further constraints are required. A
Luttinger liquid is one example in which the Green func-
tion is scale invariant but Luttinger’s theorem is satisﬁed.
The two properties we mentioned at the end of previ-
ous section, i.e., the vanishing of ImG(ω) at ω = 0, −∞
and particle-hole symmetry, are also necessary for Lut-
tinger’s theorem to be valid in the Hubbard model [8]
and the SU(N) Hubbard model [11]. This indicates that
these properties are important for the validity of Lut-
tinger’s theorem in a fermionic system.
One needs to
keep in mind that there exist special cases in which nei-
ther property is present, but Luttinger’s theorem is still
valid. We ﬁnd one such case in this work: a system of
fermions with the power-law Green function and the ex-
ponent α in the range 1 < α < 2. A simpler example is a
system of noninteracting fermions away from half-ﬁlling.
In this case, Luttinger’s theorem is valid but the system is
clearly not particle-hole symmetric. Hence, we conjecture
that particle-hole symmetry and ImG(ω = 0, −∞) = 0
are suﬃcient but not necessary conditions for the validity
of Luttinger’s theorem. A rigorous proof is necessary to
establish that these properties are the general criteria for
deciding which system respects Luttinger’s theorem.
ACKNOWLEDGMENTS
We thank NSF DMR-1461952 for partial funding of
this project.
KL is supported by the Department of
Physics at the University of Illinois and a scholarship
from the Ministry of Science and Technology, Royal Thai
Government.
ZL is supported by the Department of
Physics at the University of Illinois and a scholarship
from the Agency of Science, Technology and Research,
Singapore.
Appendix A: Modiﬁed Luttinger count with generalized cutoﬀ
Let us consider the spectral function of the form
A(p, ω) =
(
N sin πα
π
θ(εp−δ−ω)
|εp−ω|α ,
ω > −E,
N sin πα
π
f(ω)
Eα ,
ω < −E,
where f(ω) is a dimensionless cutoﬀfunction.
There are two restrictions that one needs to put on f(ω).
First,
f(ω) must fall oﬀfaster than ω−1 as ω →±∞in order for the integral
R
A(ω)dω to converge. Second, the integral
R −E
−∞
f(ω)
E dω ≪1. With this requirement, the spectral weight from the cutoﬀfunction is much less than the total
spectral weight, i.e.
R E
−∞N sin πα
π
f(ω)
Eα dω ≪
R ∞
−∞A(ω)dω = 1. Here, we explicitly exclude the physics or eﬀects from
energies beyond ±E, for example, interband transitions (from core electrons).
Using Eq. 4, one ﬁnds that the normalization factor in the limit E ≫|εp| is given by
N = (1 −α)π
sin πα
1
E1−α −δ1−α + cE1−α
(A1)



<!-- page 7 -->

7
where c ≡
R −E
−∞
f(ω)
E dω is a small parameter. Following the same procedure as in Section II C, one ﬁnds the occupation
number is
n(p) = θ(−εp + δ) + θ(εp −δ)E1−α −ε1−α
p
+ (1 −α)E1−αc
E1−α −δ1−α + (1 −α)E1−αc.
(A2)
For 0 < α < 1, setting δ = 0, one obtains
n(p) = θ(−εp) + θ(εp)

1 −
1
1 + (1 −α)c
εp
E
1−α
≈θ(−εp) + θ(εp)

1 −
εp
E
1−α
+ (1 −α)
εp
E
1−α
c

,
(A3)
while for 1 < α < 2, taking the limits E ≫δ and E ≫εp gives
n(p) = θ(−εp + δ) + θ(εp −δ)

δ
εp
α−1
−(1 −α)
  δ
E
α−1 c
1 −(1 −α)
  δ
E
α−1 c
≈θ(−εp + δ) + θ(εp −δ)
" δ
εp
α−1
−
 
1 −
 δ
εp
α−1!
(1 −α)
 δ
E
α−1
c
#
.
(A4)
For 0 < α < 1, the density is then given by
n =
Z
ddp
(2π)d θ(−εp) +
Z
ddp
(2π)d θ(εp)

1 −
εp
E
1−α
+ (1 −α)
εp
E
1−α
c

,
(A5)
and, for 1 < α < 2, the density is
n =
Z
ddp
(2π)d θ(−εp + δ) +
Z
ddp
(2π)d θ(εp −δ)
" δ
εp
α−1
−
 
1 −
 δ
εp
α−1!
(1 −α)
 δ
E
α−1
c
#
.
(A6)
For the general high-energy cutoﬀ, the claim of Luttinger’s theorem is modiﬁed from Eq. 6. Since the phase of the
retarded Green function at inﬁnity is bounded as −π < φR (−∞) ≤π, Luttinger’s theorem claims that the particle
density for 0 < α < 1 is bounded above:
n < (1 −α)
Z
ddp
(2π)d θ (εp) +
Z
ddp
(2π)d θ (−εp) .
Since the coeﬃcient in front of the θ (εp) integral is less than one, Luttinger’s theorem undercounts the particle density
for εp just above the Fermi level, or more precisely when
  εp
E
1−α < α. Similarly for 1 < α < 2, the particle density
according to Luttinger’s theorem is bounded as
n < (2 −α)
Z
ddp
(2π)d θ (εp) + 2
Z
ddp
(2π)d θ (−εp) .
Since the coeﬃcient 2 −α < 1, if the energy spectrum is such that εp > δ and

δ
εp
α−1
> 2 −α, then Luttinger’s
theorem does not hold. Therefore, we reach the same conclusion as the sharp cutoﬀcase (f(ω) = 0). Luttinger’s
theorem is not valid in general; only for some speciﬁc values of parameters can Luttinger’s theorem hold.
Appendix B: Luttinger’s theorem for Fermions with power-law self-energy
In this Appendix, we examine the validity of Luttinger’s theorem for fermions with Green function of the form,
G(p, ω) =
N
ω −˜εp −ΣPL(p, ω),
(B1)
where the self-energy is given by
ΣPL(p, ω) = −sgn(1 −α)λ(ω −εp)α
Eα−1
.
(B2)



<!-- page 8 -->

8
(a)
(b)
(c)
FIG. 6. Comparison plots of the fermion density and the integral of the phases for 0 < α < 1 with (a) λ = 0.7, (b) λ = 1, and
(c) λ = 100. Other parameters used in generating these plots are E = 1 and W = 0.001E. With these parameters and α in
the range shown in the plots, Eq. B6 is satisﬁed. n in n/N(0) labeled on the vertical axis is a nominal symbol for the fermion
density or the integral of the phases.
Here, N is the normalization factor, E is the cutoﬀenergy discussed in Section II, λ > 0 is a dimensionless coeﬃcient
which determines the correlation strength of this self-energy, and the sign function, sgn(1 −α), in front keeps the
imaginary part of the self-energy to be negative for α in the range 0 < α < 2. The branch cut from the term (ω −εp)α
is chosen to lie along the negative real axis and the phase is deﬁned to be in the range −π < φ ≤π. In the limit
λ →∞, this Green function reduces to the power-law Green function (Eq. 3) we investigate in the main text. For
simplicity of the calculation we set ˜εp = εp. As in Section II, we assume the cutoﬀenergy, E, to be much larger than
the energy function εp. This assumption allows the normalization factor, N, to be momentum independent. In the
calculation below, we only consider the case of 0 < α < 1. For the case 1 < α < 2, one needs to include a cutoﬀat
low energy, δ, in ΣP L to regulate the infrared divergence.
To verify Luttinger’s theorem, one needs to compare both sides of Eq. 5,
n =
Z
ddp
(2π)d
1
π (φR(0) −φR(−∞)) .
(B3)
We start by discussing how one can calculate the density of fermions, n, from this Green function. The spectral
function of this Green function is given by
A(p, ω) = −1
π ImG(p, ω)
=
Nsgn(1 −α) λ|ω−εp|α
πEα−1
sin (θ(−ω + εp)πα)

ω −εp + sgn(1 −α) λ|ω−εp|α
Eα−1
cos (θ(−ω + εp)πα)
2
+

λ|ω−εp|α
Eα−1
sin (θ(−ω + εp)πα)
2 .
(B4)
One can normalize the spectral function by using Eq. 4. We note that in the limit E ≫|εp|, one can set εp = 0
in the normalization factor. The occupation number can then be computed from Eq. 10. Finally, using Eq. 11, we
obtain the density, n. In order to perform the integral in Eq. 11, we replace the momentum integral,
R
ddp
(2π)d , with
the energy integral, N(0)
WR
−W
dε. Here, W is a bandwidth of the dispersion εp (this means W ∼|εp| ≪E) and N(0)
is the density of state which is assumed to be constant. The numerical results of the density are plotted for 0 < α < 1
in Fig. 6.
We now calculate the integral of the phases on the right hand side of Eq. B3. At ω = 0, we have
G(p, 0) =
N
−εp + λ (−εp)α
Eα−1
= NEα−1
λ(−εp)α .
(B5)
In the second line, we can drop the −εp term because the denominator is dominated by the self-energy term (we have
here 0 < α < 1 and E ≫|εp|). More speciﬁcally, one needs
λ
 E
|εp|
1−α
≫1.
(B6)



<!-- page 9 -->

9
This means
φR(0) = −απ(1 −θ(−εp)).
(B7)
As in the main text, we interpret −∞in φR(−∞) as the negative cutoﬀenergy, ω = −E. In the limit E ≫|εp|,
G(p, −E) =
1
−E +
λ
Eα−1 (−E)α
=
1
E ((−1 + λ cos πα) + iλ sin πα).
(B8)
Hence,
φR(−E) =



−arctan

λ sin πα
−1+λ cos πα

if
−1 + λ cos πα > 0
−arctan

λ sin πα
−1+λ cos πα

−π
if
−1 + λ cos πα < 0.
We note that in the limit λ →∞, φR(−E) →−πα as we expect from Section II. The momentum integral on the
right hand side of Eq. B3 can be converted to the energy integral in the same way as in the density calculation above.
The numerical result of the integral of the phases for 0 < α < 1 is displayed in Fig. 6.
In Fig. 6, we plot the fermion density (left hand side of Eq. B3) and the integral of the phases (right hand side
of Eq. B3) as a function of α for 0 < α < 1. The numerical integration of the phase terms is not stable for small λ
and α ≳0.7. Hence, we only display the plots in Figs. 6(a) and 6(b) with α in the range 0 < α < 0.7. One can see
that, in general, Luttinger’s theorem does not hold for this system. Furthermore, when λ →∞and α →1, the Green
function represents a normal fermion and we recover Luttinger’s theorem as shown in Fig. 6(c).
Appendix C: Spectral sum rule of A+(p, ω)
In this Appendix, we verify that the spectral function A+(p, ω) satisﬁes the spectral sum rule (Eq. 4). This will lead
to an equation useful in the density calculation in Appendix D. We note that the conﬂuent hypergeometric function
Φ(1, 1 + α, z) and the incomplete gamma function γ(α, z) ≡
zR
0
dt tα−1e−t are related [28] through
Φ(1, 1 + α, z) = αezz−αγ(α, z).
(C1)
Applying this relation to Eq. 21, one obtains the spectral sum
∞
Z
−∞
A+(p, ω)dω =
1
Γ2(γ)
 r
2˜vf
γ
∞
Z
˜vf |p|
dω

e
−
r
2˜vf (ω−p˜vf )(ω −˜vfp)γ−1γ

γ, r
2˜vf
(ω + p˜vf)

+e
−
r
2˜vf (ω+p˜vf )(ω + ˜vfp)γ−1γ

γ, r
2˜vf
(ω −p˜vf)
 
.
(C2)
Since the integral for the case p > 0 is the same as the integral for the case p < 0, we can set p > 0 without loss of
generality. We perform a change of variables, ω′ = ω −p˜vf on the ﬁrst term and ω′ = ω + p˜vf in the second term of
the integrand. We then let ω′ = 2˜vf
r x. Substituting in the integral representation of γ(α, z), we have
∞
Z
−∞
A+(p, ω)dω =
1
Γ2(γ)


∞
Z
0
dx
x+pr
Z
0
dt +
∞
Z
pr
dx
x−pr
Z
0
dt

e−xxγ−1e−ttγ−1.
We can show that the spectral sum is 1 by splitting the limits as
∞
Z
−∞
A+(p, ω)dω =
2
Γ2(γ)
∞
Z
0
dx
x
Z
0
dte−xxγ−1e−ttγ−1
+
1
Γ2(γ)


∞
Z
0
dx
x+pr
Z
x
dt +
∞
Z
pr
dx
x
Z
x−pr
dt +
pr
Z
0
dx
x
Z
0
dt

e−xxγ−1e−ttγ−1.
(C3)



<!-- page 10 -->

10
The ﬁrst term on the right hand side of Eq. C3 can be written in terms of γ(γ, x) as
2
Γ2(γ)
∞
R
0
dxe−xxγ−1γ(γ, x). Using
the integral formula of the incomplete gamma function [28],
∞
R
0
dxxa−1e−szγ(b, x) =
Γ(a+b)
b(1+s)a+b F(1, a + b; 1 + b;
1
1+s)
where Re s > 0 and Re(a + b) > 0, we ﬁnd
2
Γ2(γ)
∞
Z
0
dxe−xxγ−1γ(γ, x) = 21−2γΓ(2γ)
γΓ2(γ)
F(1, 2γ; 1 + γ; 1
2).
Here, F(a, b; c; z) denotes the hypergeometric function. Applying the identities [28]
F(a, b; 1
2(a + b) + 1
2, 1
2) =
√πΓ( 1
2(a + b) + 1
2)
Γ( 1
2a + 1
2)Γ( 1
2b + 1
2)
(C4)
and
Γ(2z) =
1
√π 22z−1Γ(z)Γ(z + 1
2),
(C5)
with 2z̸ = 0, −1, −2, ..., one ﬁnds
2
Γ2(γ)
∞
Z
0
dx
x
Z
0
dte−xxγ−1e−ttγ−1 = 1.
We next show that the second term on the right hand side of Eq. C3 vanishes. Let us deﬁne a function I(a) by
I(a) ≡
1
Γ2(γ)


∞
Z
0
dx
x+a
Z
x
dt +
∞
Z
a
dx
x
Z
x−a
dt +
a
Z
0
dx
x
Z
0
dt

e−xxγ−1e−ttγ−1.
(C6)
The second term on the right hand side of Eq. C3 can be written as I(pr). We note that I(0) = 0 and, by using the
fundamental theorem of calculus, I′(a) = 0. This means I(a) = 0 for any a and thus the second term on the right
hand side of Eq. C3, I(pr), equals zero. Consequently, the spectral sum
∞
R
−∞
A+(pf + p, ω)dω = 1. Substituting Eq.
(21) into the spectral sum rule (Eq. 4), we have
1 =
1
γΓ2(γ)
 r
2˜vf
2γ
∞
Z
˜vf |p|
dω(ω + ˜vfp)γ(ω −˜vfp)γ−1e
−ωr
˜vf Φ(1, 1 + γ, r
2˜vf
(ω + ˜vfp))
+
1
γΓ2(γ)
 r
2˜vf
2γ
∞
Z
˜vf |p|
dω(ω −˜vfp)γ(ω + ˜vfp)γ−1e
ωr
˜vf Φ(1, 1 + γ, r
2˜vf
(ω −˜vfp)).
(C7)
This equation is important for the density calculation in Appendix D.
Appendix D: Occupation number and density of the spinless Luttinger liquid at T = 0
The occupation number of the right movers in a momentum state p is given by
n+(p) =
∞
Z
−∞
dωnF (ω)A+(p, ω),
(D1)
where nF (ω) is the Fermi-Dirac distribution. Substituting Eq. 21 into Eq. D1 and taking the zero temperature limit
(so nF (ω) = θ(−ω)), we have
n+(p) =
1
γΓ2(γ)
 r
2˜vf
2γ
∞
Z
˜vf |p|
dω(ω −˜vfp)γ(ω + ˜vfp)γ−1e
−ωr
˜vf Φ(1, 1 + γ, r
2˜vf
(ω −˜vfp)).
(D2)



<!-- page 11 -->

11
Using Eq. C7, we can show that
n+(−p) = 1 −n+(p)
(D3)
or
n + (−p) −1
2 = −

n + (p) −1
2

.
(D4)
This means n(p) −1
2 is an odd function. Using Eq. D3, one can show that the density of the right mover is
n+ =
Λ
Z
−Λ
n+(p) dp
2π = Λ
2π .
(D5)
Appendix E: Luttinger’s theorem of the spinless Luttinger liquid
We determine the form of Luttinger’s theorem for a spinless Luttinger liquid. From Eq. 5, we need to know the
phases of the retarded Green function φR at ω = 0 and ω = −∞. For fermions, in the limit ω →−∞, the retarded
Green function GR(ω) →1
ω. This means φR(−∞) = −π.
We next calculate φR(0). The imaginary part of the retarded Green function is related to the spectral function by
ImGR(ω) = −πA(ω). Substituting in A+(ω) from Eq. 21, we ﬁnd
ImGR
+(ω = 0) = −
π
γΓ2(γ)θ(−˜vf|p|)
 r
2˜vf
2γ 
(˜vfp)γ(−˜vfp)γ−1Φ(1, 1 + γ, pr
2 ) + (−˜vfp)γ(˜vfp)γ−1Φ(1, 1 + γ, −pr
2 )

.
(E1)
Because of the Heaviside function, if p̸ = 0, then ImGR
+(ω = 0) = 0.
From the Kramers-Kronig relation, the real part of the Green function is given by ReGR(ω) = P
∞
R
−∞
dz A(z)
ω−z where
P denotes the Cauchy principal integral. We substitute in A+(p, ω) from Eq. 21. The result is
ReGR
+(ω = 0) = −
1
γΓ2(γ)
 r
2˜vf
2γ
∞
Z
˜vf |p|
dz e
−zr
˜vf
z

(z + ˜vfp)γ(z −˜vfp)γ−1Φ(1, 1 + γ, r
2˜vf
(z + ˜vfp))
−(z −˜vfp)γ(z + ˜vfp)γ−1Φ(1, 1 + γ, r
2˜vf
(z −˜vfp))

.
(E2)
The ratio between the ﬁrst term and the second term of the integrand, without the minus sign, is
R(p, z) =
(z + ˜vfp)Φ(1, 1 + γ,
r
2˜vf (z + ˜vfp))
(z −˜vfp)Φ(1, 1 + γ,
r
2˜vf (z −˜vfp)).
(E3)
We note that if R(p, z) ≷1, ReGR
+(ω = 0) ≶0. One can determine the condition for which R(p, z) is greater or less
than 1 by using the power series expansion of the conﬂuent hypergeometric function [28, 29],
Φ(α, β, z) =
∞
X
k=0
(α)k
(β)k
zk
k! ,
(E4)
where (λ)0 = 1, (λ)k = Γ(λ+k)
Γ(λ) , and β cannot be a non-positive integer. Applying Eq. E4 to Φ(1, 1 + γ, x), one has
Φ(1, 1 + γ, x) =
∞
X
k=0
Γ(1 + γ)
Γ(1 + γ + k)xk.
(E5)
The coeﬃcient
Γ(1+γ)
Γ(1+γ+k) is always positive if γ > −1. Therefore, xΦ(1, 1 + γ, x) is an increasing function in x for
positive x. From the limit of integration in Eq. E2, we know that z ± ˜vfp > 0. We then need to compare z + ˜vfp
and z −˜vfp. When p > 0, it is obvious that z + ˜vfp > z −˜vfp. As a result, the numerator of R(p, z) is greater than
the denominator of R(p, z) because xΦ(1, 1 + γ, x) is an increasing function. In other words, R(p, z) > 1 when p > 0.



<!-- page 12 -->

12
Alternatively, when p < 0, one has z + ˜vfp < z −˜vfp and R(p, z) < 1 by the same reason. Consequently, the real part
of the Green function changes sign at p = 0, i.e.,
ReGR
+(ω = 0) ≷0,
p ≶0.
(E6)
Combining this result with ImGR
+(ω = 0) = 0, we have φR(0) = −π + πθ(−p) = −π + πθ(GR
+(p, 0)).
Hence, from Eq. 5, Luttinger’s theorem of the right-movers is
n+ =
Z dp
2π θ(−p) =
Z dp
2π θ(GR
+(p, ω = 0)).
(E7)
[1] K. B. Blagoev and K. S. Bedell, Phys. Rev. Lett. 79,
1106 (1997).
[2] M. Yamanaka, M. Oshikawa, and I. Aﬄeck, Phys. Rev.
Lett. 79, 1110 (1997).
[3] J. M. Luttinger, Phys. Rev. 119, 1153 (1960).
[4] I. Dzyaloshinskii, Phys. Rev. B 68, 085113 (2003).
[5] J. M. Luttinger and J. C. Ward, Phys. Rev. 118, 1417
(1960).
[6] F. H. L. Essler and A. M. Tsvelik, Phys. Rev. B 65,
115117 (2002).
[7] T. D. Stanescu and G. Kotliar, Phys. Rev. B 74, 125110
(2006), cond-mat/0508302.
[8] T. D. Stanescu, P. Phillips, and T.-P. Choy, Phys. Rev.
B 75, 104503 (2007), cond-mat/0602280.
[9] A. Rosch, The European Physical Journal B 59, 495
(2007).
[10] H.-B. Yang, J. D. Rameau, Z.-H. Pan, G. D. Gu, P. D.
Johnson, H. Claus, D. G. Hinks, and T. E. Kidd, Phys.
Rev. Lett. 107, 047003 (2011).
[11] K. B. Dave, P. W. Phillips, and C. L. Kane, Phys. Rev.
Lett. 110, 090403 (2013).
[12] P. W. Anderson, Phys. Rev. B 55, 11785 (1997).
[13] Y. Ando, S. Ono, X. F. Sun, J. Takeya, F. F. Balakirev,
J. B. Betts, and G. S. Boebinger, Physical Review Let-
ters 92, 247004 (2004), cond-mat/0402025.
[14] F. F. Balakirev, J. B. Betts, A. Migliori, S. Ono, Y. Ando,
and G. S. Boebinger, Nature 424, 912 (2003).
[15] T. Valla, A. V. Fedorov, P. D. Johnson, B. O. Wells, S. L.
Hulbert, Q. Li, G. D. Gu,
and N. Koshizuka, Science
285, 2110 (1999).
[16] D. van der Marel, H. J. A. Molegraaf, J. Zaanen, Z. Nussi-
nov, F. Carbone, A. Damascelli, H. Eisaki, M. Greven,
P. H. Kes, and M. Li, Nature 425, 271 (2003).
[17] S. A. Hartnoll and A. Karch, Phys. Rev. B 91, 155126
(2015), arXiv:1501.03165 [cond-mat.str-el].
[18] Z. Leong, C. Setty, K. Limtragool, and P. W. Phillips,
Phys. Rev. B 96, 205101 (2017), arXiv:1705.07130 [cond-
mat.str-el].
[19] H. Georgi, Physical Review Letters 98, 221601 (2007),
hep-ph/0703260.
[20] P. W. Phillips, B. W. Langley,
and J. A. Hutasoit,
Phys. Rev. B 88, 115129 (2013), arXiv:1305.0006 [cond-
mat.str-el].
[21] A. Karch, K. Limtragool,
and P. W. Phillips, Journal
of High Energy Physics 3, 175 (2016), arXiv:1511.02868
[cond-mat.str-el].
[22] K. Limtragool, C. Setty, Z. Leong, and P. W. Phillips,
Phys. Rev. B 94, 235121 (2016), arXiv:1608.06637 [cond-
mat.str-el].
[23] V. Meden and K. Sch¨onhammer, Phys. Rev. B 46, 15753
(1992).
[24] G. Cacciapaglia, G. Marandella, and J. Terning, Journal
of High Energy Physics 1, 070 (2008), arXiv:0708.0005
[hep-ph].
[25] A. A. Abrikosov, L. P. Gorkov, and I. E. Dzyaloshinski,
Methods of Quantum Field Theory in Statistical Physics
(Dover, New York, 1963).
[26] F. D. M. Haldane, Journal of Physics C: Solid State
Physics 14, 2585 (1981).
[27] T. Giamarchi, Quantum Physics in One Dimension
(Clarendon Press, Oxford, 2004).
[28] F. W. J. Olver, D. W. Lozier, R. F. Boisvert, and C. W.
Clark, eds., NIST Handbook of Mathematical Functions
(Cambridge University Press, New York, 2010).
[29] N. N. Lebedev, Special Function & Their Applications
(Dover, New York, 1972).


