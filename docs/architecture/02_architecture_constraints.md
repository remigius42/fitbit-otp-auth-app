# Architecture Constraints

- ECMAScript features limited to ECMAScript 5.1 at least on smartwatch
  On the smartwatch, JavaScript runs on the JerryScript engine[^jerry_script_source]
  which is limited to ECMAScript 5.1.
- Memory available on the device is limited to 64 kB[^memory_and_storage_limit_source]
- Settings storage is limited to 5 MiB[^memory_and_storage_limit_source]
- Total app size is limited to 15 MiB[^memory_and_storage_limit_source]

[^jerry_script_source]: Source: <https://dev.fitbit.com/build/guides/application/#javascript>
[^memory_and_storage_limit_source]: Source: <https://community.fitbit.com/t5/SDK-Development/Fatal-Jerryscript-Error-ERR-OUT-OF-MEMORY/td-p/3826518>
