SELECT TOP 10

        USUARIO.USR_ID            ID_USUARIO,
        RTRIM(USUARIO.USR_CODIGO) LOGIN_USUARIO,
        RTRIM(USUARIO.USR_NOME)   NOME_USUARIO,
        RTRIM(USUARIO.USR_DEPTO)  DEPARTAMENTO_USUARIO,
        RTRIM(USUARIO.USR_CARGO)  CARGO_USUARIO,
        CASE USUARIO.USR_GRPRULE
                WHEN 1
                  THEN
                  'PRIORIZAR'
                WHEN 2
                  THEN
                  'DESCONSIDERAR'
                WHEN 3
                  THEN
                  'SOMAR'
        END                       REGRA_POR_GRUPO,
        CASE GRUUSR.USR_PRIORIZA
                WHEN 1
                  THEN
                  'SIM'
                WHEN 2
                  THEN
                  'NÃO'
        END                       PRIORIZA_GRUPO,
        CASE USUARIO.USR_MSBLQL
                WHEN 1
                  THEN
                  'SIM'
                WHEN 2
                  THEN
                  'NÃO'
        END                       BLOQUEIO_USUARIO,
        GRUPO.GR__ID              ID_GRUPO,
        RTRIM(GRUPO.GR__CODIGO)   CODIGO_GRUPO,
        RTRIM(GRUPO.GR__NOME)     NOME_GRUPO,
        CASE GRUPO.GR__MSBLQL
                WHEN 1
                  THEN
                  'SIM'
                WHEN 2
                  THEN
                  'NÃO'
        END                       BLOQUEIO_GRUPO
FROM
        SYS_USR USUARIO

    LEFT JOIN
      SYS_USR_GROUPS GRUUSR
        ON GRUUSR.USR_ID = USUARIO.USR_ID
          AND GRUUSR.D_E_L_E_T_ = ''

    LEFT JOIN
      SYS_GRP_GROUP GRUPO
        ON GRUPO.GR__ID = GRUUSR.USR_GRUPO
          AND GRUPO.D_E_L_E_T_ = ''

WHERE
        USUARIO.D_E_L_E_T_ = ''
ORDER BY
        4