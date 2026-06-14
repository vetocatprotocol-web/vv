
# NovaByte v2 — The Evolutionary Database Infrastructure

---

## Manifesto: Mengapa Database Tradisional Sudah Mati

```
Database tradisional dibangun dengan asumsi tahun 1970:
  • Developer tahu schema sebelum data ada
  • Workload bersifat statis
  • Infrastruktur adalah tanggung jawab developer
  • Observability adalah afterthought

NovaByte membalik semua asumsi ini.

Bukan hanya "database yang lebih cepat."
Bukan hanya "BaaS yang lebih pintar."

NovaByte adalah infrastruktur yang berevolusi bersama aplikasi Anda.
Self-describing. Self-optimizing. Self-healing. Fully auditable.
```

---

## Kelemahan Blueprint v1 yang Diperbaiki

```
v1 memiliki gap arsitektur berikut:

  [GAP 1] Tidak ada crash recovery yang jelas
           → WAL + checkpoint protocol tidak didefinisikan
           → v2: Nova WAL dengan atomic group commit

  [GAP 2] Speculative Raft tanpa rollback protocol eksplisit
           → Bisa data loss pada network partition
           → v2: Speculative commit dengan fencing token + compensation log

  [GAP 3] SAIL Brain tidak ada feedback loop dari hasil decision
           → Model tidak belajar dari kesalahan layout decision
           → v2: SAIL dengan closed-loop learning + cost accounting

  [GAP 4] Multi-tenancy tidak aman secara memory
           → 10K projects berbagi proses → noisy neighbor
           → v2: Isolasi per-project via Landlock + cgroup v2 + memfd_secret

  [GAP 5] Tidak ada debugging & audit layer
           → Black box untuk operator
           → v2: Nova Trace — full query lineage, causal replay

  [GAP 6] SDK tidak ada offline support
           → Tidak bisa pakai tanpa internet
           → v2: CRDT-first SDK dengan embedded SQLite bridge

  [GAP 7] Semantic Engine tidak bisa diaudit outputnya
           → LLM generate schema yang tidak transparan
           → v2: Every LLM decision dicatat, bisa di-review dan di-override

  [GAP 8] Compression tidak adaptive per kolom
           → Zstd untuk semua → tidak optimal
           → v2: Per-column codec selection berdasarkan data statistics
```

---

## Arsitektur v2: Complete Stack

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                      ║
║                              N O V A B Y T E  v2                                    ║
║                     Evolutionary Database Infrastructure                             ║
║                                                                                      ║
║  ┌──────────────────────────────────────────────────────────────────────────────┐   ║
║  │  LAYER 0 — DEVELOPER PORTAL & SEMANTIC GATEWAY                               │   ║
║  │                                                                              │   ║
║  │  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────────┐  │   ║
║  │  │  Semantic Engine │  │  Multi-Protocol  │  │  Audit & Compliance Gate  │  │   ║
║  │  │  (LLM + Schema  │  │  (SQL/GQL/REST/  │  │  (every request logged,   │  │   ║
║  │  │   Generator)    │  │   WS/SDK/NL)     │  │   signed, traceable)      │  │   ║
║  │  └────────┬────────┘  └────────┬─────────┘  └─────────────┬─────────────┘  │   ║
║  │           └───────────────────┬┘                           │                │   ║
║  │                               ▼                            │                │   ║
║  │                     [Nova Protocol Gateway]                │                │   ║
║  │                     QUIC/TLS 1.3 + WebTransport           │                │   ║
║  └───────────────────────────────┬────────────────────────────┘                    ║
║                                  │                                                  ║
║  ┌───────────────────────────────▼──────────────────────────────────────────────┐  ║
║  │  LAYER 1 — GLOBAL MESH (Edge Intelligence)                                   │  ║
║  │                                                                              │  ║
║  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │  ║
║  │  │ PoP: US-W │  │ PoP: EU-C │  │ PoP: AP-SE│  │ PoP: ME  │  │ PoP: SA  │  │  ║
║  │  │           │  │           │  │           │  │           │  │          │  │  ║
║  │  │ • L1 Auth │  │ • L1 Auth │  │ • L1 Auth │  │ • L1 Auth │  │ • L1 Auth│  │  ║
║  │  │ • EdgeKV  │  │ • EdgeKV  │  │ • EdgeKV  │  │ • EdgeKV  │  │ • EdgeKV │  │  ║
║  │  │ • WASM Fn │  │ • WASM Fn │  │ • WASM Fn │  │ • WASM Fn │  │ • WASM Fn│  │  ║
║  │  │ • Geo-DNS │  │ • Geo-DNS │  │ • Geo-DNS │  │ • Geo-DNS │  │ • Geo-DNS│  │  ║
║  │  │ • RateGrd │  │ • RateGrd │  │ • RateGrd │  │ • RateGrd │  │ • RateGrd│  │  ║
║  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘  │  ║
║  │        └──────────────┴──────────────┴──────────────┴──────────────┘         │  ║
║  │                              QUIC Mesh (mTLS, multipath)                     │  ║
║  └──────────────────────────────────┬───────────────────────────────────────────┘  ║
║                                     │                                               ║
║  ┌──────────────────────────────────▼───────────────────────────────────────────┐  ║
║  │  LAYER 2 — SAIL CORE ENGINE v2                                               │  ║
║  │                                                                              │  ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐  │  ║
║  │  │  BRAIN v2 (Closed-Loop ML)                                             │  │  ║
║  │  │                                                                        │  │  ║
║  │  │   Observe → Classify → Decide → Execute → Measure → Learn             │  │  ║
║  │  │      ↑                                                    │           │  │  ║
║  │  │      └────────────────── feedback loop ───────────────────┘           │  │  ║
║  │  └────────────────────────────────────────────────────────────────────────┘  │  ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐  │  ║
║  │  │  QUERY ENGINE v2                                                       │  │  ║
║  │  │                                                                        │  │  ║
║  │  │  Parser → Binder → Planner → [Superposition Scheduler] → Executor    │  │  ║
║  │  │                                        │                              │  │  ║
║  │  │                          ┌─────────────┼──────────┐                  │  │  ║
║  │  │                       Plan A         Plan B     Plan C               │  │  ║
║  │  │                       (JIT)         (Vectorized) (Adaptive)          │  │  ║
║  │  └────────────────────────────────────────────────────────────────────────┘  │  ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐  │  ║
║  │  │  TRANSACTION ENGINE v2 (MVCC + NovaRaft v2)                           │  │  ║
║  │  │                                                                        │  │  ║
║  │  │  Write Path:  Client → WAL Group Commit → Apply → Raft Pipeline       │  │  ║
║  │  │  Read Path:   Snapshot Isolation → MVCC Chain → Page Cache            │  │  ║
║  │  │  Recovery:    Checkpoint + WAL Replay + Compensation Log              │  │  ║
║  │  └────────────────────────────────────────────────────────────────────────┘  │  ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐  │  ║
║  │  │  NSF v2 (Nova Storage Format — Adaptive Codec)                        │  │  ║
║  │  │                                                                        │  │  ║
║  │  │  MorphicPage → ColumnStats → CodecSelector → [Compressed Block]      │  │  ║
║  │  │  Shape: ROW | COL | PAX | DELTA | SPARSE | FROZEN | VECTOR           │  │  ║
║  │  │  Codec: per-column (Integer BP | Dictionary | Gorilla | FSST | LZ4)  │  │  ║
║  │  └────────────────────────────────────────────────────────────────────────┘  │  ║
║  └──────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                      ║
║  ┌──────────────────────────────────────────────────────────────────────────────┐  ║
║  │  LAYER 3 — OPERATIONS PLANE                                                  │  ║
║  │                                                                              │  ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  ║
║  │  │  Nova Trace  │  │ Nova Insight │  │  Provisioner  │  │  Chaos Guard   │  │  ║
║  │  │ (full audit) │  │ (real metrics│  │  (auto-scale) │  │ (fault inject) │  │  ║
║  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────┘  │  ║
║  └──────────────────────────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

## SAIL Brain v2: Closed-Loop Intelligence

```rust
/// v1 masalah: SAIL memutuskan tapi tidak pernah tahu hasilnya.
/// v2 fix: setiap decision menghasilkan CostProbe yang measure dampaknya.
/// Model belajar dari keberhasilan DAN kegagalan decision sendiri.

pub struct SAILBrainV2 {
    /// Workload classifier: Decision Tree + Linear ensemble
    /// Inference: < 50ns, size: 256KB
    classifier: WorkloadClassifier,

    /// Pattern tracker per collection
    /// Count-Min Sketch + HyperLogLog untuk cardinality
    patterns: PatternTracker,

    /// Index advisor dengan cost model berbasis histograms
    index_advisor: IndexAdvisor,

    /// Layout optimizer
    layout_optimizer: LayoutOptimizerV2,

    /// Feedback store: setiap decision → outcome
    /// Digunakan untuk update bobot classifier secara online
    feedback: FeedbackStore,

    /// Circuit breaker: jika SAIL terlalu agresif → freeze
    /// Mencegah thrashing (terus-menerus ganti layout)
    circuit_breaker: SAILCircuitBreaker,
}

/// Setiap keputusan yang dibuat SAIL terekam di sini.
/// Operator bisa melihat WHY setiap optimization terjadi.
#[derive(Debug, Serialize)]
pub struct SAILDecision {
    pub id: Ulid,
    pub timestamp: SystemTime,
    pub collection: CollectionId,
    pub decision_type: DecisionType,
    pub reason: DecisionReason,       // mengapa diputuskan
    pub before_profile: WorkloadSnapshot,
    pub after_profile: Option<WorkloadSnapshot>, // diisi setelah evaluation
    pub estimated_gain_pct: f32,
    pub actual_gain_pct: Option<f32>, // diisi setelah pengukuran
    pub was_beneficial: Option<bool>,  // ground truth
}

pub enum DecisionType {
    /// Ubah storage layout ROW → PAX → COLUMN
    LayoutMorph { from: ShapeMode, to: ShapeMode },
    /// Tambah index pada kolom ini
    AddIndex { column: ColumnId, index_type: IndexType },
    /// Hapus index yang tidak pernah dipakai (90 hari)
    DropIndex { index_id: IndexId, last_used: SystemTime },
    /// Ubah kompresi codec untuk kolom ini
    ChangeCodec { column: ColumnId, from: Codec, to: Codec },
    /// Partisi ulang data berdasarkan access pattern
    RepartitionByColumn { column: ColumnId },
}

impl SAILBrainV2 {
    /// Dipanggil setelah setiap query selesai. Overhead < 30ns.
    #[inline]
    pub fn observe(&self, stats: &QueryStats) {
        self.patterns.record(stats);
        
        // Setiap N query → check apakah ada decision pending yang bisa dievaluasi
        if stats.query_count % 1_000 == 0 {
            self.feedback.evaluate_pending_decisions();
        }
        
        // Setiap 10K query → full brain cycle
        if stats.query_count % 10_000 == 0 {
            let brain = self.clone_ref();
            tokio::spawn(async move { brain.run_cycle().await });
        }
    }

    async fn run_cycle(&self) {
        // 1. Classify current workload
        let snapshot = self.patterns.snapshot();
        let profile = self.classifier.classify(&snapshot);

        // 2. Circuit breaker: jika baru saja ada decision yang buruk → skip
        if self.circuit_breaker.is_open() {
            tracing::info!(
                reason = "circuit_breaker_open",
                "SAIL skipping cycle: recent decisions were not beneficial"
            );
            return;
        }

        // 3. Generate candidate decisions
        let candidates = self.generate_decisions(&profile, &snapshot);

        // 4. Filter: hanya execute jika estimated gain > threshold
        for decision in candidates {
            if decision.estimated_gain_pct < SAIL_MIN_GAIN_THRESHOLD {
                continue;
            }

            // 5. Log decision SEBELUM eksekusi (full auditability)
            let decision_id = self.feedback.record_pending(&decision);
            tracing::info!(
                decision_id = %decision_id,
                collection = %decision.collection,
                decision = ?decision.decision_type,
                estimated_gain_pct = decision.estimated_gain_pct,
                "SAIL executing optimization decision"
            );

            // 6. Execute dengan rollback safety
            match self.execute_decision(&decision).await {
                Ok(_) => {
                    // 7. Schedule measurement setelah 5 menit
                    self.feedback.schedule_measurement(decision_id, Duration::from_secs(300));
                }
                Err(e) => {
                    self.feedback.mark_failed(decision_id, &e);
                    self.circuit_breaker.record_failure();
                }
            }
        }
    }
}

/// Circuit breaker: cegah thrashing
pub struct SAILCircuitBreaker {
    /// Jika 3 decisions terakhir tidak beneficial → open circuit
    recent_outcomes: RingBuffer<bool, 10>,
    /// Jika open: cooldown 30 menit sebelum coba lagi
    opened_at: Option<Instant>,
}
```

---

## NSF v2: Adaptive Per-Column Compression

```rust
/// v1 masalah: satu codec untuk semua kolom → suboptimal.
/// v2: setiap kolom mendapat codec yang paling sesuai data statistiknya.
/// Keputusan ini juga dicatat dan bisa diaudit.

/// Per-column statistics — dikumpulkan selama write, diupdate incremental
#[derive(Debug, Clone, Serialize)]
pub struct ColumnStats {
    pub null_ratio: f32,           // berapa persen NULL
    pub cardinality_estimate: u64, // HyperLogLog estimate
    pub min_val: ScalarValue,
    pub max_val: ScalarValue,
    pub is_monotonic: bool,        // timestamps, auto-increment IDs
    pub value_range: u64,          // max - min (untuk integer encoding)
    pub avg_run_length: f32,       // untuk RLE detection
    pub value_type: ValueType,     // detected type: Int | Float | Text | Binary | Bool
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
pub enum Codec {
    /// Integer columns, low cardinality atau monotonic
    BitPacking { bits: u8 },
    /// Sangat low cardinality (< 65K unique values)
    Dictionary,
    /// Float time-series (XOR-delta ala Gorilla / Prometheus)
    GorillaFloat,
    /// Text columns dengan banyak repeated substrings
    FSST,
    /// Semua kolom — fallback, general purpose
    Zstd { level: i32 },
    /// Ultra-fast, untuk hot data yang sering diakses
    Lz4,
    /// Constant column — satu nilai untuk semua rows
    Constant,
    /// Sparse: mayoritas NULL
    SparseRLE,
    /// Boolean columns
    Bitset,
}

pub struct CodecSelector;

impl CodecSelector {
    /// Pilih codec optimal berdasarkan statistics.
    /// Deterministik: sama input → sama output (bisa ditest & diaudit)
    pub fn select(stats: &ColumnStats) -> Codec {
        // Boolean: selalu bitset
        if stats.value_type == ValueType::Bool {
            return Codec::Bitset;
        }

        // Constant column
        if stats.cardinality_estimate == 1 {
            return Codec::Constant;
        }

        // Sparse: mayoritas NULL
        if stats.null_ratio > 0.8 {
            return Codec::SparseRLE;
        }

        // Integer dengan range kecil → bit packing
        if stats.value_type == ValueType::Int {
            let bits_needed = (stats.value_range as f64).log2().ceil() as u8;
            if bits_needed <= 32 {
                return Codec::BitPacking { bits: bits_needed };
            }
        }

        // Float monotonic time-series → Gorilla
        if stats.value_type == ValueType::Float && stats.is_monotonic {
            return Codec::GorillaFloat;
        }

        // Text dengan low cardinality → dictionary
        if stats.value_type == ValueType::Text && stats.cardinality_estimate < 65_536 {
            return Codec::Dictionary;
        }

        // Text dengan repeated substrings → FSST
        if stats.value_type == ValueType::Text {
            return Codec::FSST;
        }

        // Hot data (frequently accessed) → Lz4 (speed > ratio)
        // Cold/frozen data → Zstd level 19 (ratio > speed)
        // Default
        Codec::Zstd { level: 3 }
    }
}

/// MorphicPage v2: tambah VECTOR mode untuk AI workloads
#[repr(u8)]
pub enum ShapeMode {
    Row    = 0,   // NSM: OLTP, point lookups
    Column = 1,   // DSM: OLAP, column scans
    PAX    = 2,   // PAX: HTAP, mixed
    Delta  = 3,   // Delta dari base page: update-heavy tables
    Sparse = 4,   // Nullable dominant
    Frozen = 5,   // Immutable, maximum compression
    Vector = 6,   // Dense float32/float16 untuk similarity search (HNSW)
    TimeSeries = 7, // Timestamp-ordered, Gorilla encoding seluruh page
}
```

---

## WAL v2: Atomic Group Commit + Point-in-Time Recovery

```rust
/// v1 tidak mendefinisikan recovery protocol → gap kritis.
/// v2: WAL dengan atomic group commit + full PITR support.

/// Write-Ahead Log entry
#[repr(C)]
pub struct WalEntry {
    pub lsn: u64,               // log sequence number, monotonic
    pub collection_id: u32,
    pub transaction_id: u64,
    pub entry_type: WalEntryType,
    pub payload_len: u32,
    pub checksum: u32,          // CRC32C hardware accelerated
    // followed by payload bytes
}

pub enum WalEntryType {
    Begin,
    Write { page_id: u64, offset: u16, len: u16 },
    Delete { page_id: u64, slot: u16 },
    Commit { timestamp: u64 },
    Abort,
    Checkpoint { lsn_start: u64 },   // snapshot point untuk truncation
    SchemaChange { version: u32 },
}

/// Group commit: batch multiple transactions dalam satu fsync
/// Latency tambah sedikit, throughput naik drastis
pub struct WalGroupCommit {
    /// Buffer untuk entries yang belum di-fsync
    pending: Mutex<Vec<WalEntry>>,
    /// Notifier untuk transactions yang menunggu commit
    notify: Notify,
    /// Background flusher
    flush_interval: Duration, // default: 1ms
}

impl WalGroupCommit {
    /// Writer memanggil ini, lalu menunggu flush
    pub async fn append_and_wait(&self, entry: WalEntry) -> Result<u64> {
        let lsn = {
            let mut pending = self.pending.lock();
            let lsn = entry.lsn;
            pending.push(entry);
            lsn
        };

        // Tunggu sampai batch ini di-fsync
        self.notify.notified().await;
        Ok(lsn)
    }

    /// Background task: flush setiap interval atau jika buffer penuh
    async fn flush_loop(&self) {
        loop {
            tokio::time::sleep(self.flush_interval).await;

            let batch = {
                let mut pending = self.pending.lock();
                std::mem::take(&mut *pending)
            };

            if batch.is_empty() { continue; }

            // Single fsync untuk seluruh batch
            self.wal_file.write_batch(&batch).await?;
            self.wal_file.fsync().await?;

            // Notify semua waiter
            self.notify.notify_waiters();
        }
    }
}

/// Point-in-Time Recovery
pub struct PITRManager {
    /// WAL segments disimpan di object storage (S3-compatible)
    /// Retention: 30 hari default, configurable
    segment_store: Arc<ObjectStore>,

    /// Base snapshots setiap 1 jam
    snapshot_interval: Duration,
}

impl PITRManager {
    /// Recover ke timestamp apapun dalam retention window
    /// Output: database state persis seperti di titik waktu itu
    pub async fn recover_to(&self, target: SystemTime) -> Result<()> {
        // 1. Temukan snapshot terdekat sebelum target
        let snapshot = self.find_nearest_snapshot(target).await?;

        // 2. Restore snapshot
        self.restore_snapshot(&snapshot).await?;

        // 3. Replay WAL dari snapshot sampai target timestamp
        let segments = self.segment_store
            .list_after(snapshot.timestamp)
            .await?;

        for segment in segments {
            for entry in segment.entries() {
                if entry.timestamp > target { break; }
                self.apply_wal_entry(&entry).await?;
            }
        }

        tracing::info!(
            target = ?target,
            base_snapshot = ?snapshot.timestamp,
            "PITR recovery complete"
        );

        Ok(())
    }
}
```

---

## NovaRaft v2: Safe Speculative Commits

```rust
/// v1 masalah: speculative commit tanpa rollback protocol eksplisit.
/// v2: setiap speculative commit punya fencing token + compensation log.
/// Jika replication gagal, state machine bisa rollback dengan aman.

pub struct NovaRaftV2 {
    state: RaftState,

    /// Speculative buffer: entries yang sudah di-apply tapi belum di-majority-ack
    /// Key: log_index, Value: speculatively applied entry + compensation
    speculative: BTreeMap<u64, SpeculativeEntry>,

    /// Log pipeline: multiple in-flight entries ke followers
    /// Window size: 128 entries (adaptive berdasarkan RTT)
    pipeline: LogPipeline<128>,

    /// Fencing: setiap speculative entry punya monotonic token
    /// Client yang menyimpan hasil speculative harus validasi token ini
    fencing: FencingTokenIssuer,
}

pub struct SpeculativeEntry {
    pub entry: LogEntry,
    pub applied_at: Instant,
    /// Cara untuk membatalkan efek entry ini jika rollback diperlukan
    pub compensation: CompensationAction,
    /// Client yang harus dinotifikasi jika rollback terjadi
    pub client_callbacks: Vec<ClientCallback>,
}

pub enum CompensationAction {
    /// Delete rows yang di-insert
    DeleteRows { page_id: u64, row_ids: SmallVec<[u32; 8]> },
    /// Restore nilai sebelumnya (untuk UPDATE)
    RestoreValues { page_id: u64, before_image: Bytes },
    /// Re-insert rows yang di-delete
    ReinsertRows { page_id: u64, row_data: Bytes },
}

impl NovaRaftV2 {
    pub async fn propose_speculative(
        &self,
        entry: LogEntry,
    ) -> Result<SpeculativeCommitHandle> {
        // 1. Pastikan kita masih leader
        self.assert_leader()?;

        // 2. Tulis ke WAL dengan group commit
        let lsn = self.wal.append_and_wait(entry.clone()).await?;

        // 3. Capture before-image untuk compensation
        let compensation = self.capture_compensation(&entry);

        // 4. Apply ke state machine (speculative)
        self.state_machine.apply_speculative(&entry);

        // 5. Catat di speculative buffer
        let token = self.fencing.issue();
        self.speculative.insert(lsn, SpeculativeEntry {
            entry: entry.clone(),
            applied_at: Instant::now(),
            compensation,
            client_callbacks: vec![],
        });

        // 6. Kirim ke followers secara async (tidak blocking)
        self.pipeline.submit(entry, lsn);

        // 7. Return handle — client bisa gunakan SEKARANG
        // Handle otomatis "committed" jika majority ack dalam N ms
        // Handle otomatis "rolled back" jika gagal
        Ok(SpeculativeCommitHandle {
            lsn,
            fencing_token: token,
            raft: self.weak_ref(),
        })
    }

    /// Dipanggil ketika majority ack diterima
    pub fn confirm_speculative(&self, lsn: u64) {
        if let Some(entry) = self.speculative.remove(&lsn) {
            // Entry sekarang resmi committed
            // Notifikasi client: entry ini permanent
            for cb in entry.client_callbacks {
                cb.on_confirmed();
            }
        }
    }

    /// Dipanggil ketika replication gagal (network partition, node crash)
    pub async fn rollback_speculative(&self, from_lsn: u64) {
        // Rollback dari LSN tertinggi ke bawah (LIFO order)
        let to_rollback: Vec<_> = self.speculative
            .range(from_lsn..)
            .rev()
            .collect();

        for (lsn, entry) in to_rollback {
            tracing::warn!(
                lsn = lsn,
                collection = %entry.entry.collection_id,
                "Rolling back speculative entry due to replication failure"
            );

            self.apply_compensation(&entry.compensation).await;

            for cb in &entry.client_callbacks {
                cb.on_rolled_back();
            }

            self.speculative.remove(lsn);
        }
    }
}
```

---

## Multi-Tenancy: Memory-Safe Isolation

```rust
/// v1 tidak membahas isolasi antar-tenant.
/// v2: setiap project mendapat isolasi berlapis.

/// Isolasi model: bukan proses terpisah (terlalu mahal),
/// bukan thread terpisah (tidak cukup isolasi),
/// tetapi "isolated execution context" — lightweight, enforced by kernel.

pub struct TenantIsolation {
    /// Cgroup v2: batasi CPU, memory, IO per project
    cgroup: CgroupV2Handle,

    /// Landlock: restrict filesystem access ke direktori project saja
    landlock: LandlockRuleset,

    /// memfd_secret: memory tidak bisa di-dump oleh proses lain
    /// Digunakan untuk menyimpan encryption keys + auth tokens
    secret_memory: MemfdSecret,

    /// Per-tenant memory allocator
    /// Mencegah memory leak di satu tenant mempengaruhi tenant lain
    allocator: TenantArena,

    /// Quota enforcement
    quotas: TenantQuotas,
}

pub struct TenantQuotas {
    pub max_storage_bytes: u64,
    pub max_requests_per_second: u32,
    pub max_concurrent_connections: u32,
    pub max_query_execution_ms: u64,  // kill query yang terlalu lama
    pub max_memory_bytes: u64,
    pub max_realtime_subscriptions: u32,
}

/// Setiap request membawa TenantContext
/// Semua operasi secara otomatis terisolasi
pub struct TenantContext {
    pub project_id: ProjectId,
    pub user_id: Option<UserId>,
    pub session_token: SessionToken,
    pub quotas: Arc<TenantQuotas>,
    pub isolation: Arc<TenantIsolation>,
    
    /// Audit trail untuk request ini
    pub trace: RequestTrace,
}
```

---

## Nova Trace: Full Auditability

```rust
/// v1 tidak ada audit layer.
/// v2: setiap query, mutation, schema change, SAIL decision, dan auth event
/// terekam dalam immutable append-only audit log.
/// Operator bisa replay, inspect, dan debug APAPUN.

/// Setiap event dalam sistem mengimplementasi trait ini
pub trait AuditEvent: Serialize {
    fn event_type(&self) -> &'static str;
    fn project_id(&self) -> ProjectId;
    fn severity(&self) -> Severity;
    fn timestamp(&self) -> SystemTime;
}

/// Contoh: query audit event
#[derive(Debug, Serialize)]
pub struct QueryAuditEvent {
    pub trace_id: Ulid,
    pub project_id: ProjectId,
    pub user_id: Option<UserId>,
    pub timestamp: SystemTime,
    pub query_text: String,        // query asli yang dikirim
    pub normalized_query: String,  // setelah parsing & normalization
    pub execution_plan: ExecutionPlan,
    pub duration_us: u64,
    pub rows_scanned: u64,
    pub rows_returned: u64,
    pub bytes_read: u64,
    pub index_used: Option<IndexId>,
    pub cache_hit: bool,
    pub error: Option<QueryError>,
    /// Apakah query ini di-generate oleh Semantic Engine (LLM)?
    pub semantic_origin: Option<SemanticOrigin>,
}

/// Jika query berasal dari LLM → catat input NL dan output SQL
#[derive(Debug, Serialize)]
pub struct SemanticOrigin {
    pub natural_language_input: String,
    pub generated_sql: String,
    pub llm_confidence: f32,
    pub was_overridden: bool, // apakah user edit SQL sebelum execute
}

pub struct NovaTrace {
    /// Append-only ring buffer di memory (last 1M events per project)
    hot_buffer: SegmentedRingBuffer<AuditRecord>,

    /// Persistent store: dikirim ke object storage secara async
    /// Format: Parquet (queryable via SQL)
    persistent_store: Arc<TraceArchive>,
}

impl NovaTrace {
    /// Emit event — non-blocking, < 100ns overhead
    pub fn emit(&self, event: impl AuditEvent) {
        let record = AuditRecord::new(event);
        self.hot_buffer.push(record);
        // Background goroutine drain ke persistent store
    }

    /// Query audit log dengan SQL (meta-query)
    /// Sangat berguna untuk debugging & compliance
    pub async fn query(&self, sql: &str) -> Result<QueryResult> {
        // Execute SQL langsung di atas audit Parquet files
        self.persistent_store.query_parquet(sql).await
    }

    /// Causal replay: reconstruct state database di titik waktu manapun
    /// Berguna untuk debugging "kenapa data ini berubah?"
    pub async fn causal_replay(
        &self,
        project: ProjectId,
        target_row: RowId,
        until: SystemTime,
    ) -> Vec<AuditRecord> {
        // Temukan semua events yang menyentuh row ini
        self.query(&format!(
            "SELECT * FROM audit_log
             WHERE project_id = '{project}'
             AND affected_rows @> ARRAY['{target_row}']
             AND timestamp <= '{until}'
             ORDER BY timestamp ASC"
        )).await
    }
}
```

---

## Semantic Engine v2: Transparent + Auditable LLM

```rust
/// v1 masalah: LLM adalah black box, developer tidak tahu mengapa
/// schema digenerate seperti itu.
/// v2: setiap LLM decision dicatat, bisa di-inspect, bisa di-override.

pub struct SemanticEngineV2 {
    /// Embedded Phi-3 mini 3.8B INT4 quantized (~2GB RAM)
    llm: Arc<EmbeddedLLM>,

    /// Schema registry + versioning
    schemas: SchemaRegistry,

    /// Audit trail untuk semua LLM decisions
    audit: Arc<NovaTrace>,
}

pub struct SchemaGenerationResult {
    pub schema: Schema,
    pub indexes: Vec<IndexDefinition>,
    pub rls_policies: Vec<RLSPolicy>,
    pub sdk_types: GeneratedTypes,

    /// Reasoning trail: mengapa schema ini digenerate
    /// Operator bisa baca ini untuk memahami keputusan LLM
    pub reasoning: Vec<ReasoningStep>,

    /// Alternative schemas yang dipertimbangkan tapi tidak dipilih
    pub alternatives: Vec<AlternativeSchema>,

    /// Confidence score per table/column
    pub confidence: HashMap<String, f32>,
}

#[derive(Debug, Serialize)]
pub struct ReasoningStep {
    pub step: u8,
    pub description: String,        // "Identified entity: User with email (unique)"
    pub decision: String,           // "Created users table with unique index on email"
    pub rationale: String,          // "Email appears to be used as login identifier"
    pub confidence: f32,
}

impl SemanticEngineV2 {
    pub async fn describe_to_schema(
        &self,
        description: &str,
        project: &Project,
    ) -> Result<SchemaGenerationResult> {
        // 1. LLM generate schema dengan chain-of-thought prompting
        let llm_output = self.llm.generate_with_reasoning(
            SCHEMA_GENERATION_SYSTEM_PROMPT,
            description,
        ).await?;

        // 2. Parse output (structured JSON dari LLM)
        let result = self.parse_llm_schema_output(llm_output)?;

        // 3. PENTING: audit setiap keputusan LLM
        self.audit.emit(SemanticDecisionEvent {
            trace_id: Ulid::new(),
            project_id: project.id,
            input: description.to_string(),
            reasoning: result.reasoning.clone(),
            generated_schema: result.schema.clone(),
            confidence: result.confidence.clone(),
        });

        // 4. Tampilkan ke developer — mereka HARUS review & approve
        // Tidak otomatis di-apply tanpa konfirmasi (safety first)
        Ok(result)
    }

    /// Developer bisa override bagian mana saja dari generated schema
    pub async fn apply_with_override(
        &self,
        result: SchemaGenerationResult,
        overrides: Vec<SchemaOverride>,
        approved_by: UserId,
    ) -> Result<AppliedSchema> {
        let final_schema = result.schema.apply_overrides(overrides.clone());

        self.audit.emit(SchemaAppliedEvent {
            original: result.schema,
            overrides,
            final_schema: final_schema.clone(),
            approved_by,
            applied_at: SystemTime::now(),
        });

        self.schemas.apply(final_schema).await
    }
}
```

---

## SDK v2: Offline-First + CRDT Sync

```rust
/// v1 masalah: SDK tidak bisa offline.
/// v2: SDK punya embedded local store (SQLite) yang sync via CRDT.

/// Untuk Rust client
use novabyte::prelude::*;

// Zero config — baca env atau config file
let nb = NovaByte::builder()
    .from_env()                        // NOVABYTE_URL + NOVABYTE_KEY
    .offline_store("./local.db")       // embedded SQLite untuk offline
    .sync_strategy(SyncStrategy::CRDTMerge)
    .build()
    .await?;

// === QUERY (ONLINE + OFFLINE) ===

// Online query — fallback ke local cache jika offline
let users = nb.from("users")
    .select(["id", "name", "email"])
    .filter(col("age").gt(25))
    .order_by("created_at", Desc)
    .limit(20)
    .offline_fallback(OfflineBehavior::UseCache)  // <-- baru di v2
    .fetch::<User>()
    .await?;

// Offline mutation — CRDT-tracked, auto-sync ketika online kembali
let new_order = nb.from("orders")
    .insert(Order {
        user_id: current_user.id,
        items: cart.items.clone(),
        status: OrderStatus::Pending,
    })
    .conflict_resolution(ConflictResolution::LastWriteWins) // atau Custom
    .execute()
    .await?;
// Jika offline: tersimpan di local store, sync ketika online

// === REALTIME v2 ===

// Realtime dengan built-in reconnect + backpressure
let mut stream = nb.realtime()
    .table("orders")
    .filter(col("user_id").eq(current_user.id))
    .events([Event::Insert, Event::Update])
    .buffer_size(100)                  // backpressure: pause jika buffer penuh
    .reconnect(ReconnectPolicy::ExponentialBackoff {
        initial: Duration::from_millis(100),
        max: Duration::from_secs(30),
        jitter: true,
    })
    .subscribe::<Order>()
    .await?;

while let Some(event) = stream.next().await {
    match event {
        RealtimeEvent::Insert(order) => handle_new_order(order),
        RealtimeEvent::Update { old, new, changed_fields } => {
            // changed_fields berisi HANYA field yang berubah
            if changed_fields.contains("status") {
                notify_user(&new.status);
            }
        }
        RealtimeEvent::Reconnecting { attempt, delay } => {
            log::info!("Reconnecting (attempt {attempt}, delay {delay:?})");
        }
    }
}

// === AUTH v2 ===

// Auth dengan built-in MFA + passkey
nb.auth.sign_up_email("user@example.com", "password")
    .with_mfa(MfaMethod::TOTP)
    .await?;

nb.auth.sign_in_passkey(credential).await?;

// Session management otomatis
// Tidak perlu handle token refresh — SDK handles it
let session = nb.auth.session(); // always valid atau error
let user = session.user();

// === STORAGE v2 ===

// Upload dengan progress tracking + resumable
let upload = nb.storage
    .bucket("videos")
    .upload_resumable("video.mp4", file_bytes)
    .chunk_size(5 * 1024 * 1024)     // 5MB chunks
    .on_progress(|pct| println!("Upload: {pct}%"))
    .transform(Transform::new()
        .video_transcode(VideoQuality::P720)
        .generate_thumbnail())
    .public()
    .await?;

println!("URL: {}", upload.url);
println!("Thumbnail: {}", upload.thumbnail_url.unwrap());

// === MIGRATIONS v2 ===

// Code-first, typed, rollbackable
nb.migrate()
    .version(3)
    .description("Add product inventory tracking")
    .up(|m| m
        .create_table("products")
        .column("id", Type::Uuid.pk().default_random())
        .column("name", Type::Text.not_null())
        .column("price", Type::Decimal(10, 2).not_null())
        .column("inventory", Type::Int.default(0).check("inventory >= 0"))
        .index(["name"], Unique)
        .rls(|r| r
            .select("authenticated")   // siapapun bisa baca
            .insert("service_role")    // hanya service yang bisa insert
            .update("service_role"))
    )
    .down(|m| m.drop_table("products"))  // rollback SQL otomatis
    .run()
    .await?;

// === DIAGNOSTICS v2 — untuk debugging ===

// Explain query — lihat execution plan
let plan = nb.from("orders")
    .filter(col("status").eq("pending"))
    .explain(ExplainMode::Analyze)
    .await?;

println!("{}", plan.format_tree()); // ASCII tree

// Live query metrics
let metrics = nb.diagnostics()
    .slow_queries(threshold: Duration::from_millis(100))
    .last(Duration::from_hours(1))
    .await?;

for q in metrics {
    println!(
        "[{}ms p99] {}: {}",
        q.p99_ms, q.count, q.normalized_query
    );
}
```

---

## Nova Insight: Observability Built-In

```
Semua metric, trace, dan log tersedia tanpa setup.
Tidak perlu Datadog, Grafana, atau apapun.

Default dashboards yang tersedia:

  [1] Query Performance
      • p50/p95/p99 latency per collection
      • Slow query log (auto-captured > 100ms)
      • Index hit rate
      • Cache hit rate
      • Query plan regressions (alert jika plan tiba-tiba lebih lambat)

  [2] Storage Intelligence
      • Per-collection storage layout (ROW/PAX/COL/FROZEN)
      • Compression ratio per kolom
      • SAIL decisions history (kapan optimize, berapa gain)
      • Page morphing activity

  [3] Replication Health
      • Raft leader stability
      • Replication lag per follower
      • Speculative commit rollback rate (harus < 1%)
      • Multi-region sync latency

  [4] Tenant Resource Usage
      • CPU/Memory/IO per project
      • Quota utilization (alert 80%)
      • Connection pool saturation
      • Realtime subscription count

  [5] Security Audit
      • Authentication events (login, logout, failed attempts)
      • Schema changes (siapa, kapan, apa)
      • RLS violations (query yang di-reject)
      • Semantic Engine decisions (LLM generate apa)

  [6] Function Execution
      • Cold start rate
      • Function duration histogram
      • Error rate per function
      • Memory usage per invocation
```

---

## Superposition Scheduler v2: Smarter Speculation

```rust
/// v2 tambah: adaptive budget, measurement, dan operator visibility.

pub struct SuperpositionSchedulerV2 {
    universes: Vec<ExecutionUniverse>,
    budget: AdaptiveSpeculationBudget,
    metrics: SpeculationMetrics,
}

pub struct AdaptiveSpeculationBudget {
    /// Max CPU fraction untuk speculation (default 15%, max 30%)
    cpu_fraction: AtomicF32,
    /// Win rate tracker: berapa persen speculation benar-benar lebih cepat
    win_rate: ExponentialMovingAverage,
    /// Jika win rate < 40% → reduce budget (speculation tidak worth it)
    /// Jika win rate > 70% → increase budget
}

pub struct SpeculationMetrics {
    pub total_speculated: AtomicU64,
    pub speculation_wins: AtomicU64,  // speculative plan memang lebih cepat
    pub cpu_wasted_ns: AtomicU64,     // CPU yang dibuang untuk plan yang kalah
    pub avg_speedup_pct: AtomicF32,   // rata-rata speedup dari speculation
}

impl SuperpositionSchedulerV2 {
    pub async fn execute(&self, query: Query, ctx: &TenantContext) -> QueryResult {
        // Jika query sederhana (< THRESHOLD): langsung, no overhead
        if query.estimated_cost_ns() < SPECULATION_THRESHOLD_NS {
            return self.execute_single(query).await;
        }

        // Jika budget habis: juga langsung
        if !self.budget.has_capacity() {
            return self.execute_single(query).await;
        }

        // Generate candidate plans (max 3)
        let plans = self.planner.generate_candidates(&query, 3);

        // Jika hanya 1 plan: tidak perlu speculation
        if plans.len() <= 1 {
            return self.execute_single_plan(plans.into_iter().next().unwrap()).await;
        }

        // Jalankan semua plans secara parallel
        let cancel = CancellationGroup::new();
        let winner: Arc<OnceLock<(QueryResult, usize)>> = Arc::new(OnceLock::new());
        let start = Instant::now();

        let handles: Vec<_> = plans.into_iter().enumerate().map(|(i, plan)| {
            let cancel = cancel.clone();
            let winner = winner.clone();
            tokio::spawn(async move {
                let result = execute_plan(plan, cancel.token()).await;
                if winner.set((result, i)).is_ok() {
                    cancel.cancel_all();
                }
            })
        }).collect();

        futures::future::join_all(handles).await;

        let (result, winning_plan_idx) = Arc::try_unwrap(winner)
            .unwrap()
            .into_inner()
            .unwrap();

        // Update metrics
        let elapsed = start.elapsed();
        self.metrics.total_speculated.fetch_add(1, Relaxed);
        if winning_plan_idx > 0 {
            self.metrics.speculation_wins.fetch_add(1, Relaxed);
        }

        // Emit ke audit trace (operator bisa lihat plan mana yang menang)
        ctx.trace.record_speculation(SpeculationRecord {
            query_trace_id: ctx.trace.current_id(),
            winning_plan_idx,
            total_plans: plans_count,
            elapsed_ns: elapsed.as_nanos() as u64,
        });

        result
    }
}
```

---

## Provisioner & Auto-Scaling

```rust
/// Komponen yang tidak ada di v1: bagaimana cluster scale sendiri?

pub struct NovaProvisioner {
    /// Provider: bare metal, Hetzner, AWS, GCP, atau hybrid
    infra: Arc<InfraProvider>,
    /// Metrics feed untuk scaling decisions
    metrics: Arc<NovaInsight>,
    /// Current cluster topology
    topology: RwLock<ClusterTopology>,
}

pub struct ScalingPolicy {
    /// Scale out: tambah node jika CPU > 70% untuk 5 menit
    pub scale_out_threshold: ScalingThreshold,
    /// Scale in: hapus node jika CPU < 20% untuk 30 menit
    pub scale_in_threshold: ScalingThreshold,
    /// Min/max nodes per region
    pub min_nodes: u32,
    pub max_nodes: u32,
    /// Cooling period: jangan scale lagi dalam N menit setelah scale event
    pub cooldown: Duration,
    /// Pre-emptive scaling: scale berdasarkan trafik prediction (ML)
    pub predictive_scaling: bool,
}

impl NovaProvisioner {
    /// Scaling loop: berjalan setiap 30 detik
    pub async fn scaling_loop(&self) {
        loop {
            tokio::time::sleep(Duration::from_secs(30)).await;

            let current_metrics = self.metrics.cluster_summary().await;
            let decision = self.evaluate_scaling(&current_metrics);

            match decision {
                ScalingDecision::ScaleOut { region, count } => {
                    tracing::info!(
                        region = %region,
                        count = count,
                        cpu_pct = current_metrics.cpu_pct,
                        "Auto-scaling OUT: provisioning new nodes"
                    );
                    self.add_nodes(region, count).await;
                }
                ScalingDecision::ScaleIn { nodes } => {
                    // Drain dulu sebelum terminate
                    for node in nodes {
                        self.drain_node(node).await;
                        self.terminate_node(node).await;
                    }
                }
                ScalingDecision::Stable => {}
            }
        }
    }
}
```

---

## Chaos Guard: Built-in Fault Tolerance Testing

```rust
/// Database yang tidak pernah ditest gagal → akan gagal di produksi.
/// NovaByte include chaos testing built-in — bisa aktif di staging.

pub struct ChaosGuard {
    /// Apakah chaos aktif (default: false, hanya aktif di staging)
    enabled: AtomicBool,
    /// Probabilitas inject fault per operasi
    fault_config: ChaosConfig,
}

pub struct ChaosConfig {
    /// Probabilitas query timeout (simulate slow disk)
    pub query_timeout_prob: f32,
    /// Probabilitas network partition antar nodes
    pub partition_prob: f32,
    /// Probabilitas node crash (SIGKILL random node)
    pub node_crash_prob: f32,
    /// Probabilitas slow WAL write (simulate degraded NVMe)
    pub slow_wal_prob: f32,
    /// Probabilitas corrupt page (test recovery)
    pub corrupt_page_prob: f32,
}

/// Output: laporan apakah sistem bertahan
#[derive(Debug, Serialize)]
pub struct ChaosReport {
    pub test_duration: Duration,
    pub faults_injected: u64,
    pub data_loss_detected: bool,      // harus false
    pub consistency_violations: u64,   // harus 0
    pub recovery_time_p99: Duration,
    pub operations_completed: u64,
    pub operations_failed: u64,
    pub availability_pct: f32,         // target: 99.999%
}
```

---

## NSF v2 dengan Vector Mode: Native AI Workloads

```rust
/// v2 tambah: native vector storage untuk embedding similarity search.
/// Tidak perlu plugin terpisah — terintegrasi dalam storage engine.

/// Vector page: dense float32 atau float16 vectors
#[repr(C, align(4096))]
pub struct VectorPage {
    header: VectorPageHeader,
    /// Vectors tersimpan sebagai flat array
    /// [vec_0_dim_0, vec_0_dim_1, ..., vec_0_dim_N, vec_1_dim_0, ...]
    data: [f32; VECTOR_PAGE_CAPACITY],
}

/// HNSW (Hierarchical Navigable Small World) index
/// State of the art untuk approximate nearest neighbor search
pub struct HNSWIndex {
    /// Multi-layer graph
    layers: Vec<HNSWLayer>,
    /// Dimensionality
    dim: u32,
    /// efConstruction dan M parameter
    config: HNSWConfig,
    /// Mapping: node_id → vector page location
    node_map: NodeMap,
}

impl HNSWIndex {
    /// Insert vector — O(log n) average
    pub async fn insert(&self, id: RowId, vector: &[f32]) -> Result<()> {
        assert_eq!(vector.len(), self.dim as usize);
        // ... HNSW insertion algorithm
    }

    /// k-nearest neighbor search — O(log n) average
    pub async fn search(
        &self,
        query: &[f32],
        k: usize,
        ef_search: usize,
    ) -> Vec<(RowId, f32)> { // (row_id, cosine_distance)
        // ... HNSW search algorithm
    }
}

/// SDK support untuk vector operations
// Simpan embedding
nb.from("documents")
    .insert(Document {
        content: "...",
        embedding: embed_model.encode("...")?, // float32 vec
    })
    .await?;

// Similarity search — natural, type-safe
let similar = nb.from("documents")
    .select(["id", "content"])
    .vector_search(
        "embedding",
        query_vector,
        k: 10,
        min_similarity: 0.8,
    )
    .fetch::<Document>()
    .await?;
```

---

## Dependency Stack v2: Curated + Justified

```toml
[workspace.dependencies]

# === ASYNC RUNTIME ===
tokio        = { version = "1", features = ["full"] }
monoio       = "0.2"             # io_uring native, untuk hot path storage I/O

# === NETWORK ===
quinn        = "0.11"            # QUIC (WebTransport support)
axum         = "0.8"             # HTTP/REST gateway
h2           = "0.4"             # HTTP/2 untuk gRPC-style APIs
tokio-tungstenite = "0.24"      # WebSocket realtime

# === PARSING ===
nom          = "7"               # zero-copy binary protocol parser
sonic-rs     = "0.3"            # SIMD JSON (Bytedance, fastest Rust JSON)
sqlparser    = "0.51"           # SQL parser

# === SERIALIZATION / STORAGE FORMAT ===
rkyv         = "0.8"            # zero-copy serde (NSF format)
bytes        = "1"              # zero-copy byte buffers

# === MEMORY MANAGEMENT ===
bumpalo      = "3"              # arena allocator (per-query)
slab         = "0.4"            # slab allocator (stable addresses)
memmap2      = "0.9"            # mmap untuk large files
tikv-jemallocator = "0.6"      # jemalloc: lebih baik dari system malloc

# === JIT COMPILATION ===
cranelift-codegen = "0.109"    # JIT untuk OLTP queries (fast compile)
inkwell      = "0.4"            # LLVM bindings (JIT untuk OLAP, lebih optimal)

# === ML / BRAIN ===
candle-core          = "0.6"   # Hugging Face ML in Rust (no Python dep)
candle-nn            = "0.6"
candle-transformers  = "0.6"   # Phi-3 inference untuk Semantic Engine

# === INDEX ===
fastbloom    = "0.7"           # Bloom filter (existence check sebelum disk read)
# ART (Adaptive Radix Tree): implement sendiri — butuh tight integration
# HNSW: implement sendiri — butuh custom memory layout untuk NSF

# === CONSENSUS / REPLICATION ===
# NovaRaft: implement sendiri — speculative commit butuh custom modifications

# === AUTH ===
opaque-ke    = "3"             # OPAQUE: zero-knowledge password auth
ed25519-dalek = "2"           # EdDSA token signing
webauthn-rs  = "0.5"          # Passkey / WebAuthn
oauth2       = "4"             # OAuth2 social login

# === COMPRESSION ===
zstd         = "0.13"         # general purpose, level 1-22
lz4_flex     = "0.11"         # ultra fast, untuk hot data
bitpacking   = "0.9"          # SIMD integer bit packing
# FSST: implement sendiri (Fast Static Symbol Table) — string compression
# Gorilla float encoding: implement sendiri (XOR delta)

# === CONCURRENCY ===
crossbeam-epoch = "0.9"       # epoch-based memory reclamation (lock-free structs)
crossbeam-channel = "0.5"     # lock-free channels
cache-padded    = "1"         # prevent false sharing
dashmap         = "6"         # concurrent hashmap

# === HASHING ===
blake3       = "1"            # fast cryptographic hashing (WAL integrity)
crc32fast    = "1"            # CRC32C hardware (page checksum)
ahash        = "0.8"          # fast non-crypto (hashtable keys)
xxhash-rust  = "0.8"          # XXH3: alternatif untuk non-security hash

# === CRDT (offline sync) ===
diamond-types = "1"           # production-grade CRDT (text + JSON)
# Custom CRDT untuk structured data types

# === OBSERVABILITY ===
tracing           = "0.1"
tracing-subscriber = "0.3"
opentelemetry     = "0.26"    # OTLP export ke Grafana/Jaeger/dll
metrics           = "0.23"    # prometheus-compatible metrics

# === WASM RUNTIME ===
wasmtime     = "24"           # edge functions runtime (sandboxed)

# === ISOLATION ===
# landlock-rs: Landlock LSM untuk filesystem isolation
# cgroups-rs: cgroup v2 untuk resource limiting

# === FRONTEND (Dashboard) ===
leptos       = "0.7"          # Rust → WASM (SSR + hydration)

# === MISC ===
ulid         = "1"            # ULID (sortable unique IDs, better than UUID v4)
smallvec     = "1"            # stack-allocated vec (avoid heap alloc untuk small lists)
parking_lot  = "0.12"        # faster mutex/rwlock daripada std
once_cell    = "1"            # lazy statics + one-time init
```

---

## Performance Targets v2: Honest + Achievable

```
NovaByte v2 vs Kompetitor — single region, 3-node cluster, NVMe SSD

┌─────────────────────────────────────────────────────────────────────────────┐
│  Metric                     │ Firebase  │ Supabase  │ NovaByte v2           │
├─────────────────────────────────────────────────────────────────────────────┤
│  API latency p50             │  80ms     │  15ms     │  0.5ms                │
│  API latency p99             │  300ms    │  80ms     │  5ms                  │
│  API latency p99.9           │  N/A      │  N/A      │  20ms                 │
│  Write throughput            │  5K/s     │  15K/s    │  500K/s (WAL limited) │
│  Read throughput             │  20K/s    │  80K/s    │  5M/s (cached)        │
│  Realtime latency p50        │  100ms    │  40ms     │  1ms                  │
│  Concurrent connections      │  ~100K    │  ~50K     │  ~1M                  │
│  OLAP query (10M rows)       │  N/A      │  2s       │  10ms (columnar)      │
│  RAM per 10K projects        │  huge     │  ~100GB   │  ~8GB (isolated)      │
│  WASM cold start             │  500ms    │  200ms    │  1ms                  │
│  Online schema migration     │  manual   │  ~10s     │  < 100ms              │
│  Multi-region sync lag p50   │  ~200ms   │  ~100ms   │  ~20ms                │
│  Vector search (1M vecs)     │  N/A      │  ~50ms    │  ~2ms (HNSW)          │
│  Recovery RTO                │  minutes  │  minutes  │  < 30s (WAL replay)   │
│  Recovery RPO                │  N/A      │  minutes  │  < 1s (group commit)  │
└─────────────────────────────────────────────────────────────────────────────┘

Catatan jujur:
  • Write 500K/s adalah WAL-limited, bukan compute-limited
  • Read 5M/s hanya untuk hot data di page cache
  • Angka ini untuk dedicated hardware, bukan shared cloud
  • p99.9 latency sangat bergantung pada compaction scheduling
  • Multi-region 20ms asumsi PoP < 100ms RTT
```

---

## Roadmap v2: Realistis

```
Q1–Q2 2025 — Foundation (Sudah berjalan)
  ✦ NSF Morphic pages (ROW/PAX/COLUMN/DELTA/FROZEN)
  ✦ io_uring I/O engine (monoio)
  ✦ WAL v2: group commit + PITR scaffolding
  ✦ Basic SQL parser + Cranelift JIT
  ✦ EdDSA auth + OPAQUE password protocol

Q3 2025 — Core Intelligence
  ✦ SAIL Brain v2: closed-loop learning
  ✦ Superposition scheduler v2
  ✦ Adaptive per-column codec selection
  ✦ NovaRaft v2: speculative commit + compensation log

Q4 2025 — Completeness
  ✦ Realtime engine (Disruptor-inspired)
  ✦ File storage + dedup + transformations
  ✦ WASM edge functions (Wasmtime sandboxed)
  ✦ SDK: Rust + TypeScript + Offline CRDT
  ✦ Nova Trace: full audit log

Q1 2026 — Intelligence Layer
  ✦ Semantic Engine v2 (Phi-3, auditable)
  ✦ HNSW vector index + Vector page mode
  ✦ Leptos dashboard: full Rust → WASM
  ✦ Multi-tenancy isolation (Landlock + cgroup v2)

Q2 2026 — Production Ready
  ✦ Multi-region deployment (5 regions)
  ✦ Provisioner + auto-scaling
  ✦ Billing system
  ✦ Chaos Guard testing suite
  ✦ Public beta

Q3 2026 — Scale
  ✦ 50+ Edge PoP
  ✦ SDK: Dart + Swift + Python
  ✦ Offline-first mobile SDK
  ✦ GA launch

Q4 2026 — Ecosystem
  ✦ 300+ Edge PoP
  ✦ Marketplace: community WASM functions
  ✦ Enterprise: SSO + SCIM + audit export
  ✦ Serverless tier (scale to zero)
```

---

## Prinsip Desain yang Tidak Bisa Dikompromikan

```
1. AUDITABILITY FIRST
   Tidak ada black box. Setiap keputusan — dari SAIL, dari Semantic Engine,
   dari Raft, dari Provisioner — terekam dan bisa di-inspect.
   Jika Anda tidak bisa jelaskan MENGAPA sesuatu terjadi, itu bug.

2. OPERATOR ERGONOMICS = USER ERGONOMICS
   Dashboard tidak hanya untuk developer. Operations team harus bisa
   melihat apa yang terjadi di dalam sistem tanpa baca kode.

3. SAFE DEFAULTS, ZERO FOOTGUNS
   Semua timeout, retry, backpressure, rate limiting — aktif by default.
   Developer tidak perlu configure ini sendiri untuk behavior yang aman.

4. COMPRESSION TANPA SACRIFICIAL LAMBDA
   Kompresi tidak boleh trade-off dengan correctness atau debuggability.
   Setiap data yang disimpan harus bisa dibaca kembali dengan tepat.
   Setiap optimization harus reversible.

5. EVOLUTION OVER REPLACEMENT
   Database ini harus bisa di-upgrade secara rolling, zero downtime.
   Schema migrations, storage format changes, index changes —
   semua harus online, tidak ada maintenance window.

6. FAILURE IS NORMAL, HANDLE IT GRACEFULLY
   Network partition, disk failure, node crash — bukan edge case.
   ChaosGuard memastikan sistem bertahan dari semua ini.
   Recovery harus cepat, otomatis, dan ter-audit.
```

---
