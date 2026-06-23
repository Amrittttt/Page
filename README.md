The protocol runs one OT per bit.

For each bit `i`:

1. Alice picks random `Ui`.
2. Alice prepares:

```text
m0 = Ui
m1 = Ui + x
```

3. Bob uses bit `yi` as his OT choice.
4. Bob receives:

```text
mci = Ui + yi * x
```

5. Alice accumulates:

```text
sumU += 2^i * Ui
```

6. Bob accumulates:

```text
V += 2^i * mci
```

At the end:

```text
Alice returns U = -sumU
Bob returns V = sum over 2^i * (Ui + yi * x)
```

Now expand Bob's value gently:

```text
V = sum(2^i * Ui) + x * sum(2^i * yi)
```

But:

```text
sum(2^i * yi) = y
```

So:

```text
V = sumU + x * y
```

Alice has:

```text
U = -sumU
```

Therefore:

```text
U + V = -sumU + sumU + x*y = x*y
```

That cancellation is the main math story.

## Protocol flow in this code

### Startup

1. Start C++ server.
2. Server listens on TCP port `9100`.
3. Start TypeScript client.
4. Client connects to server.

### Handshake

1. Server generates multiplicative share `y`.
2. Server sends `y` to client.
3. Client generates multiplicative share `x`.
4. Client sends `x` to server.

Note: For a real privacy-preserving system, parties would not reveal secret shares like this. In this assignment, the exchange is used so both sides can verify the result.

### 256 COT rounds

For every bit of Bob's `y`:

1. Alice sends point `A = aG`.
2. Bob chooses based on bit `yi`.
3. Bob sends point `B`.
4. Alice derives two keys `k0` and `k1`.
5. Alice encrypts `m0` and `m1`.
6. Bob derives only the matching key and decrypts only the chosen message.
7. Both sides accumulate their weighted sums.

### Completion

1. Alice computes additive share `U`.
2. Bob computes additive share `V`.
3. They exchange final shares for demo verification.
4. Both check:

```text
U + V == x * y mod n
```

## File-by-file map

### `README.md`

Explains build steps, run commands, expected output, and the Appendix A.3 protocol summary.

Use this in interviews as the project overview.

### `proto/mta.proto`

Defines all protobuf messages exchanged over the wire:

- `Handshake`: carries a 32-byte multiplicative share.
- `OtAliceStep1`: carries Alice's compressed curve point `A`.
- `OtBobStep2`: carries Bob's compressed curve point `B`.
- `OtAliceStep3`: carries encrypted `m0` and `m1`.
- `RunComplete`: carries final additive share.
- `Envelope`: defined, but the implementation uses a simpler manual type byte on the wire.

### `proto/mta.options`

Used by nanopb to generate fixed-size byte arrays for C/C++. This avoids dynamic allocation for fixed-size fields like 32-byte scalars and 33-byte compressed points.

### `client/src/main.ts`

Alice's entry point.

Responsibilities:

- Connect to the server.
- Generate random scalar `x`.
- Receive server's `y`.
- Send `x`.
- Run COT sender logic.
- Print additive share `U`.
- Verify `U + V == x*y`.

### `client/src/cot/cot_sender.ts`

Alice's COT sender implementation.

Important logic:

- Runs 256 OT rounds.
- Creates `Ui`.
- Creates correlated messages:

```text
m0 = Ui
m1 = Ui + x
```

- Derives two encryption keys using ECDH-style curve operations.
- Sends encrypted messages.
- Accumulates Alice's final negative share.

### `client/src/cot/field.ts`

Client-side scalar arithmetic.

Responsibilities:

- Generate 32-byte random scalars.
- Convert buffers to `bigint`.
- Add, subtract, negate, and multiply modulo secp256k1 order.
- Compute `2^i`.
- Accumulate weighted sums.

### `client/src/crypto/secp256k1.ts`

Minimal TypeScript implementation of secp256k1 point operations needed by the client.

Responsibilities:

- Curve constants `P`, `N`, `Gx`, `Gy`.
- Point addition.
- Point doubling.
- Scalar multiplication.
- Point compression and decompression.
- SHA-256 key derivation from point x-coordinate.
- XOR encryption/decryption helper.

Interview phrasing:

"The client uses Node's `crypto` module for randomness and SHA-256, and implements the small amount of curve arithmetic needed for the assignment in TypeScript. For production, I would prefer a reviewed constant-time secp256k1 library."

### `client/src/net/peer.ts`

Client networking and protobuf framing.
