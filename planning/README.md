# Planning Folder

Folder ini digunakan sebagai ruang kerja (working area) selama proses perencanaan dan pengembangan proyek.

Berbeda dengan folder `docs/`, isi folder ini **tidak dianggap sebagai sumber kebenaran (Single Source of Truth)**.

Dokumen di dalam folder ini dapat berubah sewaktu-waktu selama proses diskusi.

## Tujuan

* Menyimpan ide yang belum diputuskan.
* Menyimpan backlog pekerjaan.
* Mencatat keputusan penting beserta alasannya.
* Menyimpan pertanyaan yang belum memiliki jawaban.
* Mencatat perubahan besar selama proyek berjalan.

## Perbedaan dengan folder docs

### planning/

* Bersifat sementara.
* Digunakan untuk brainstorming.
* Berisi ide, diskusi, dan catatan.
* Tidak menjadi acuan implementasi.

### docs/

* Bersifat resmi.
* Menjadi Single Source of Truth.
* Menjadi acuan development.
* Digunakan oleh AI dan developer sebagai referensi utama.

## Workflow

1. Ide baru ditulis di `ideas.md`.
2. Jika ide disetujui, pindahkan ke `backlog.md`.
3. Ketika keputusan sudah final, catat di `decisions.md`.
4. Jika memengaruhi spesifikasi, perbarui dokumen di folder `docs/`.
5. Catat perubahan penting di `changelog.md`.
