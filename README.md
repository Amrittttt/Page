# Interview Prep: MTA using Correlated Oblivious Transfer

This project is a TCP/IP client-server demo that converts multiplicative shares into additive shares using Correlated Oblivious Transfer (COT), following Appendix A.3.1, A.3.2, and A.3.3 of `COT.pdf`.

Think of the whole project as this story:

- Alice is the Node.js/TypeScript client.
- Bob is the C++ server.
- Alice owns a random secret number `x`.
- Bob owns a random secret number `y`.
- They want to produce two new numbers `U` and `V` such that:

```text
U + V = x * y   modulo secp256k1_order
```

Alice gets `U`. Bob gets `V`. Together, their additive shares reconstruct the product, but the protocol demonstrates how the product can be split without directly computing it in one place during the COT loop.

## One-minute interview explanation

"I built a TCP/IP client-server implementation of multiplicative-to-additive share conversion using correlated oblivious transfer. The server is C++ using Boost.Asio for networking, nanopb for protobuf encoding, and trezor-crypto for secp256k1 operations. The client is Node.js/TypeScript using `net`, `crypto`, and protobufjs. Both sides generate 32-byte scalar values modulo the secp256k1 curve order. The protocol runs 256 OT rounds, one for each bit of Bob's scalar `y`. In each round, Alice prepares two correlated messages, `Ui` and `Ui + x`, and Bob obliviously receives only the one selected by bit `yi`. Bob accumulates weighted selected messages to get `V`, and Alice accumulates the negative weighted sum of `Ui` to get `U`. At the end, `U + V` equals `x * y` modulo the curve order."

## Why this exists

In secure multi-party computation, parties often hold secret shares instead of raw values. Sometimes a protocol gives values in multiplicative form, but another protocol needs additive form.

Multiplicative sharing means:

```text
secret = x * y
```

Additive sharing means:

```text
secret = U + V
```

This project converts from the first style to the second.

Small example without crypto:

```text
x = 7
y = 5
x * y = 35

Choose U = 12
Then V = 23

U + V = 12 + 23 = 35
```

The real protocol does this modulo a huge secp256k1 number, and it uses COT so the split can be produced round by round.

## Concepts from zero

### Modular arithmetic

Modulo means numbers wrap around after a maximum value.

Clock example:

```text
10 + 5 on a 12-hour clock = 3
```

because after 12, the clock wraps back to 1.

Crypto uses this idea with very large numbers. In this project, all scalar math is done modulo the secp256k1 curve order:

```text
n = FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
```

So every scalar is kept inside:

```text
0 <= scalar < n
```

### Elliptic curve

An elliptic curve is a set of points obeying a curve rule. For secp256k1, the rough shape is defined by:

```text
y^2 = x^3 + 7
```

You do not need to draw it in the interview. The important idea is:

- There is a special starting point called `G`.
- If you multiply `G` by a secret number `a`, you get a public point `A`.
- Going from `a` to `A` is easy.
- Going from `A` back to `a` is believed to be infeasible.

Toy analogy:

```text
private number a = secret jump count
