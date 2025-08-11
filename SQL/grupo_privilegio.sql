SELECT TOP 10
        GRUPCAD.GR__ID            ID_GRUPO,
        RTRIM(GRUPCAD.GR__CODIGO) CODIGO_GRUPO,
        RTRIM(GRUPCAD.GR__NOME)   NOME_GRUPO,
        REGRA.RL__ID              ID_PRIVILEGIO,
        RTRIM(REGRA.RL__CODIGO)   CODIGO_PRIVILEGIO,
        RTRIM(REGRA.RL__DESCRI)   NOME_PRIVILEGIO,
        RTRIM(ROTINAS.RL__ROTINA) ROTINA,
        RTRIM(RL__DESROT)         DESCRICAO_ROTINA,
        CASE ROTINAS.RL__ACESSO
                WHEN 1
                  THEN
                  'PERMITIDO'
                WHEN 2
                  THEN
                  'NÃO PERMITIDO'
                WHEN 3
                  THEN
                  'NEGADO'
        END                       ACESSO_ROTINA,
        BOTAO.RL__ITEM            ORDEM_BOTAO,
        CASE BOTAO.RL__ACESSO
                WHEN 1
                  THEN
                  'PERMITIDO'
                WHEN 2
                  THEN
                  'NÃO PERMITIDO'
                WHEN 3
                  THEN
                  'NEGADO'
        END                       ACESSO_BOTAO,
        RTRIM(BOTAO.RL__DESMDEF)  DESCRICAO_BOTAO,
        RTRIM(BOTAO.RL__MENUDEF)  CHAMADA_BOTAO

FROM
        SYS_RULES_TRANSACT ROTINAS

    JOIN
      SYS_RULES REGRA
        ON REGRA.RL__ID = ROTINAS.RL__ID
          AND REGRA.D_E_L_E_T_ = ''

    JOIN
      SYS_RULES_GRP_RULES GRUPO
        ON GRUPO.GR__RL_ID = REGRA.RL__ID
          AND GRUPO.D_E_L_E_T_ = ''

    JOIN
      SYS_GRP_GROUP GRUPCAD
        ON GRUPCAD.GR__ID = GRUPO.GROUP_ID
          AND GRUPCAD.D_E_L_E_T_ = ''

    LEFT JOIN
      SYS_RULES_FEATURES BOTAO
        ON BOTAO.RL__ID = REGRA.RL__ID
          AND BOTAO.RL__ROTINA = ROTINAS.RL__ROTINA
          AND BOTAO.D_E_L_E_T_ = ''

WHERE
        ROTINAS.D_E_L_E_T_ = ''
        AND ROTINAS.RL__ACESSO = '1' -- 1 = Permitido / 2 = Não Permitido / 3 = Negado
ORDER BY
        GRUPCAD.GR__ID,
        REGRA.RL__ID
