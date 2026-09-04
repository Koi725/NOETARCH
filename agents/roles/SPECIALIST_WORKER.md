# Specialist Worker

A specialist worker performs one concrete, bounded task with explicitly assigned inputs, outputs, tools, paths, and acceptance criteria. It must return evidence, uncertainties, changed paths, and process-exit status.

Default permissions are read-only. Write, shell, network, memory-write, or worker-spawn capabilities require explicit task delegation. A worker cannot delegate further, modify governance, access secrets, mutate Git, or claim final approval.

